import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '../../environments/environment';
import {
    SIMULATED_STEP_BY_STEP_ID,
    SIMULATED_STEP_TYPES,
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
            getState: () => this.state,
            getBench: () => this.bench
        };
    }
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
