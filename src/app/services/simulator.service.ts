import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '../../environments/environment';
import { Devices } from '../models/business/enums/devices.model';
import { CommandDirector } from '../models/business/class/command-director.model';
import {
    SIMULATED_STEP_BY_STEP_ID,
    SIMULATED_STEP_TYPES,
    SimulatedFault,
    SimulatedMeter,
    SimulatedStepSetting,
    SimulatedStepType,
    SimulatorScenario,
    SimulatorState,
    VirtualBench
} from '../models/business/interafces/simulator.model';
import { IpcService } from './ipc.service';

const STORAGE_KEY = 'simulador';

// Integración: el resultado lo deciden los integradores que carga el usuario; el simulador solo
// tiene que completar los impulsos del paso, en este tiempo por defecto.
const DEFAULT_INTEGRATION_SECONDS = 3;

// Vacío: los impulsos del medidor se reparten en esta fracción inicial del paso, así un puesto
// que tiene que fallar falla antes de que termine el tiempo.
const VACUUM_EMISSION_FRACTION = 0.4;

const DEFAULT_FAULT_DELAY_MS = 2000;

// Posiciones fijas en las tramas de respuesta (ver CommandsSizes):
// calculador B|CS|<puesto>|<resultado 3>|Z y patrón B|PS|<K 4>|<multiplicador>|UR|US|UT|<IR 2>|...
const CAL_STAND_OFFSET = 5;
const CAL_RESULT_OFFSET = 7;
const PAT_MULTIPLIER_OFFSET = 10;
const PAT_CURRENT_L1_OFFSET = 21;
// corriente informada por el patrón con la falla `sobrecorriente` (la alarma salta con más de 2,4 A)
const OVERCURRENT_AMPS = 2.5;

/**
 * Simulador de la máquina virtual (corre en la ventana de la máquina virtual).
 *
 * Cada puesto tiene un medidor simulado. Con un escenario armado, las respuestas de la
 * calculadora salen de ese medidor y de las condiciones del banco (el paso en curso y sus
 * parámetros); con "Aleatorio" se mantiene el comportamiento histórico.
 *
 * La selección se recuerda entre sesiones (localStorage, que vive en userData). Para los tests
 * la misma API queda en `window.__simulador`.
 */
@Injectable({
    providedIn: 'root'
})
export class SimulatorService {
    readonly state$: BehaviorSubject<SimulatorState>;
    readonly bench$ = new BehaviorSubject<VirtualBench | null>(null);
    /** fallas activas; no se recuerdan entre sesiones para no dejar una olvidada en desarrollo */
    readonly faults$ = new BehaviorSubject<SimulatedFault[]>([]);

    // momento del último RESET de la calculadora en cada puesto (inicio de la medición)
    private readonly resetAt = new Map<number, number>();

    constructor(
        private readonly ipcService: IpcService,
        private readonly zone: NgZone
    ) {
        this.state$ = new BehaviorSubject<SimulatorState>(this.load());
        this.observeBench();
        this.exposeForTests();
    }

    get state(): SimulatorState {
        return this.state$.value;
    }

    get bench(): VirtualBench | null {
        return this.bench$.value;
    }

    get benchStepType(): SimulatedStepType | undefined {
        return this.bench ? SIMULATED_STEP_BY_STEP_ID[this.bench.step_id] : undefined;
    }

    /** Con "Aleatorio" responde el simulador histórico */
    get isActive(): boolean {
        return this.state.scenario !== 'aleatorio';
    }

    setScenario(scenario: SimulatorScenario): void {
        const meters = scenario === 'personalizado' ? this.state.meters : buildMeters(scenario);
        this.save({ scenario, meters });
    }

    /** Ajuste de un puesto (1 = primer puesto): el escenario pasa a "Personalizado" */
    setStand(stand: number, stepType: SimulatedStepType, setting: SimulatedStepSetting): void {
        const meters = this.state.meters.map((meter, index) =>
            index === stand - 1 ? { ...meter, [stepType]: { ...setting } } : meter
        );
        this.save({ scenario: 'personalizado', meters });
    }

    addFault(fault: SimulatedFault): void {
        this.faults$.next([...this.faults$.value, { ...fault }]);
    }

    removeFault(index: number): void {
        this.faults$.next(this.faults$.value.filter((_, faultIndex) => faultIndex !== index));
    }

    clearFaults(): void {
        this.faults$.next([]);
    }

    /**
     * Aplica la primera falla activa que corresponde al comando recibido. Devuelve la respuesta a
     * enviar (`null` = no contestar) y cuánto demorarla.
     */
    applyFaults(command: string, response: string): { response: string | null; delayMs: number } {
        const device = CommandDirector.getTo(command);
        const stand =
            device === Devices.CAL
                ? CommandDirector.decodeCompactNumber(CommandDirector.getBlocks(command)[2] ?? '', 0)
                : null;
        const index = this.faults$.value.findIndex(
            (fault) =>
                fault.device === device &&
                (device !== Devices.CAL || !fault.stand || fault.stand === stand) &&
                (fault.kind !== 'sobrecorriente' || device === Devices.PAT) &&
                (!['otro-puesto', 'ignorado'].includes(fault.kind) || device === Devices.CAL)
        );
        if (index < 0 || !response) {
            return { response, delayMs: 0 };
        }
        const fault = this.consumeFault(index);

        switch (fault.kind) {
            case 'sin-respuesta':
                return { response: null, delayMs: 0 };
            case 'tarde':
                return { response, delayMs: fault.delayMs ?? DEFAULT_FAULT_DELAY_MS };
            case 'corrupta':
                // sin el fin de trama: la app la descarta
                return { response: `${response.slice(0, -1)}Y`, delayMs: 0 };
            case 'otro-puesto': {
                const otherStand = ((stand ?? 1) % APP_CONFIG.standsQuantity) + 1;
                return {
                    response: replaceAt(
                        response,
                        CAL_STAND_OFFSET,
                        CommandDirector.encodeCompactNumber(otherStand, 1, 0)
                    ),
                    delayMs: 0
                };
            }
            case 'ignorado':
                return { response: replaceAt(response, CAL_RESULT_OFFSET, 'X00'), delayMs: 0 };
            case 'sobrecorriente': {
                // la app divide la corriente por el multiplicador del patrón (10 con corrientes bajas)
                const multiplier = CommandDirector.decodeCompactNumber(response.charAt(PAT_MULTIPLIER_OFFSET), 0) || 1;
                const current = CommandDirector.encodeCompactNumber(OVERCURRENT_AMPS * multiplier, 2, 2);
                return { response: replaceAt(response, PAT_CURRENT_L1_OFFSET, current), delayMs: 0 };
            }
        }
    }

    /** La calculadora del puesto se reinicia: empieza la medición */
    reset(stand: number): void {
        this.resetAt.set(stand, Date.now());
    }

    /** Error del medidor en contraste [%] (respuesta TS01) */
    contrastError(stand: number): number {
        return this.resolve(stand, 'contrast') ?? 0;
    }

    /** Impulsos contados desde el reset (respuesta TS02: vacío, arranque e integración) */
    pulses(stand: number): number {
        const stepType = this.benchStepType;
        if (!stepType || stepType === 'contrast') {
            return 0;
        }
        const seconds = this.secondsSinceReset(stand);
        const value = this.resolve(stand, stepType);
        const params = this.bench?.form_control_raw ?? {};

        if (stepType === 'vacuum') {
            const total = value ?? 0;
            const emissionSeconds = numberParam(params, 'durationSeconds', 10) * VACUUM_EMISSION_FRACTION;
            return Math.floor(total * Math.min(1, seconds / emissionSeconds));
        }
        // arranque e integración: impulsos a ritmo constante, llegando a `target` en `value` segundos
        if (value === null) {
            return 0;
        }
        const target =
            stepType === 'boot' ? numberParam(params, 'allowedPulses', 1) : numberParam(params, 'durationPulses', 10);
        const pulses = value <= 0 ? target : Math.floor((target * seconds) / value);
        // integración: el medidor se queda en los impulsos del paso, así el error calculado depende
        // solo de los integradores que carga el usuario
        return stepType === 'integration' ? Math.min(pulses, target) : pulses;
    }

    /**
     * Valor efectivo del medidor de un puesto en un paso, con los parámetros del banco:
     * impulsos (vacío), error % (contraste), segundos (arranque e integración; `null` = no arranca).
     */
    resolve(stand: number, stepType: SimulatedStepType): number | null {
        const setting = this.state.meters[stand - 1]?.[stepType] ?? { outcome: 'aprueba' };
        if (setting.outcome === 'valor') {
            return setting.value ?? (stepType === 'boot' ? null : 0);
        }
        const approve = setting.outcome === 'aprueba';
        const params =
            this.bench && SIMULATED_STEP_BY_STEP_ID[this.bench.step_id] === stepType ? this.bench.form_control_raw : {};

        switch (stepType) {
            case 'vacuum':
                return approve ? 0 : numberParam(params, 'maxAllowedPulses', 0) + 1;
            case 'contrast': {
                const maxError = numberParam(params, 'maxAllowedError', 1);
                // el signo alterna por puesto, para ver errores positivos y negativos
                const sign = stand % 2 === 0 ? -1 : 1;
                return sign * (approve ? maxError / 2 : Math.max(maxError * 2, 1));
            }
            case 'boot': {
                const min = numberParam(params, 'minDurationSeconds', 2);
                const max = numberParam(params, 'maxDurationSeconds', 4);
                if (approve) {
                    return (min + max) / 2;
                }
                // falla de las dos formas: los impares llegan antes del mínimo, los pares no arrancan
                return stand % 2 === 1 ? min / 2 : null;
            }
            case 'integration':
                return DEFAULT_INTEGRATION_SECONDS;
        }
    }

    private consumeFault(index: number): SimulatedFault {
        const fault = this.faults$.value[index];
        if (fault.times) {
            const remaining = fault.times - 1;
            this.faults$.next(
                remaining > 0
                    ? this.faults$.value.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, times: remaining } : item
                      )
                    : this.faults$.value.filter((_, itemIndex) => itemIndex !== index)
            );
        }
        return fault;
    }

    private secondsSinceReset(stand: number): number {
        if (!this.resetAt.has(stand)) {
            this.resetAt.set(stand, Date.now());
        }
        return (Date.now() - (this.resetAt.get(stand) as number)) / 1000;
    }

    private observeBench(): void {
        this.ipcService.on('handle-virtual-machine-bench', (_: unknown, bench: VirtualBench | null) => {
            this.zone.run(() => this.bench$.next(bench));
        });
        // si la ventana se abre con un paso en curso
        this.ipcService
            .invoke<VirtualBench | null>('get-virtual-machine-bench')
            .then((bench) => this.zone.run(() => this.bench$.next(bench)))
            .catch(() => {});
    }

    private load(): SimulatorState {
        const fallback: SimulatorState = { scenario: 'aleatorio', meters: buildMeters('aleatorio') };
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as SimulatorState | null;
            if (!saved?.scenario) {
                return fallback;
            }
            // la cantidad de puestos depende del build: se completan o recortan los guardados
            const meters = buildMeters('todo-aprueba').map((meter, index) => ({ ...meter, ...saved.meters?.[index] }));
            return { scenario: saved.scenario, meters };
        } catch {
            return fallback;
        }
    }

    private save(state: SimulatorState): void {
        this.state$.next(state);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // sin almacenamiento el simulador funciona igual, solo no recuerda la selección
        }
    }

    private exposeForTests(): void {
        (window as unknown as { __simulador: unknown }).__simulador = {
            setScenario: (scenario: SimulatorScenario) => this.zone.run(() => this.setScenario(scenario)),
            setStand: (stand: number, stepType: SimulatedStepType, setting: SimulatedStepSetting) =>
                this.zone.run(() => this.setStand(stand, stepType, setting)),
            addFault: (fault: SimulatedFault) => this.zone.run(() => this.addFault(fault)),
            clearFaults: () => this.zone.run(() => this.clearFaults()),
            getFaults: () => this.faults$.value,
            getState: () => this.state,
            getBench: () => this.bench
        };
    }
}

function replaceAt(text: string, offset: number, value: string): string {
    return text.slice(0, offset) + value + text.slice(offset + value.length);
}

function numberParam(params: Record<string, unknown>, name: string, fallback: number): number {
    const value = Number(params[name]);
    return Number.isFinite(value) ? value : fallback;
}

/**
 * Medidores de un escenario armado. En "Mixto" cada paso tiene puestos que aprueban y puestos que
 * fallan: el puesto n falla el paso k (vacío 0, contraste 1, arranque 2) si (n + k) es múltiplo de 3.
 */
function buildMeters(scenario: SimulatorScenario): SimulatedMeter[] {
    return Array.from({ length: APP_CONFIG.standsQuantity }, (_, index) => {
        const stand = index + 1;
        const meter = {} as SimulatedMeter;
        SIMULATED_STEP_TYPES.forEach((stepType, stepIndex) => {
            let fails = false;
            if (scenario === 'todo-falla') {
                fails = true;
            } else if (scenario === 'mixto') {
                fails = (stand + stepIndex) % 3 === 0;
            }
            // integración: el resultado lo dan los integradores, no el medidor
            meter[stepType] = { outcome: fails && stepType !== 'integration' ? 'falla' : 'aprueba' };
        });
        return meter;
    });
}
