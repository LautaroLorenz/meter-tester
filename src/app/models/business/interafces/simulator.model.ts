import { Steps } from '../enums/steps.model';

/**
 * Simulador de la máquina virtual: cada puesto tiene un medidor simulado que responde a la
 * calculadora según lo que se le pida en cada paso.
 *
 * - `aleatorio`: el comportamiento histórico (valores al azar).
 * - `todo-aprueba` / `todo-falla` / `mixto`: escenarios armados.
 * - `personalizado`: un escenario con ajustes puesto por puesto.
 */
export type SimulatorScenario = 'aleatorio' | 'todo-aprueba' | 'todo-falla' | 'mixto' | 'personalizado';

export const SIMULATOR_SCENARIOS: Array<{ label: string; value: SimulatorScenario }> = [
    { label: 'Aleatorio', value: 'aleatorio' },
    { label: 'Todo aprueba', value: 'todo-aprueba' },
    { label: 'Todo falla', value: 'todo-falla' },
    { label: 'Mixto', value: 'mixto' },
    { label: 'Personalizado', value: 'personalizado' }
];

/** Pasos en los que el medidor simulado responde */
export type SimulatedStepType = 'vacuum' | 'contrast' | 'boot' | 'integration';

export const SIMULATED_STEP_TYPES: SimulatedStepType[] = ['vacuum', 'contrast', 'boot', 'integration'];

export const SIMULATED_STEP_BY_STEP_ID: Partial<Record<Steps, SimulatedStepType>> = {
    [Steps.VacuumTest]: 'vacuum',
    [Steps.ContrastTest]: 'contrast',
    [Steps.BootTest]: 'boot',
    [Steps.IntegrationTest]: 'integration'
};

/**
 * Qué hace el medidor en un paso:
 * - `aprueba` / `falla`: el simulador calcula un valor que da ese resultado con los parámetros del paso.
 * - `valor`: valor directo (ver `SIMULATED_VALUE_UNITS`). En arranque, `null` es "no arranca" (sin impulsos).
 */
export type SimulatedOutcome = 'aprueba' | 'falla' | 'valor';

export interface SimulatedStepSetting {
    outcome: SimulatedOutcome;
    value?: number | null;
}

/** Significado del valor directo en cada paso */
export const SIMULATED_VALUE_UNITS: Record<SimulatedStepType, string> = {
    vacuum: 'impulsos en todo el paso',
    contrast: 'error [%]',
    boot: 'segundos hasta llegar a los impulsos permitidos',
    integration: 'segundos hasta completar los impulsos'
};

export type SimulatedMeter = Record<SimulatedStepType, SimulatedStepSetting>;

export interface SimulatorState {
    scenario: SimulatorScenario;
    /** Medidor de cada puesto; índice 0 = puesto 1 */
    meters: SimulatedMeter[];
}

/**
 * Condiciones del banco: el paso que se está ejecutando y sus parámetros. En el banco real las
 * ajusta el operario (con generador manual la máquina no las recibe): en modo máquina virtual la
 * app se las avisa al simulador al empezar cada paso.
 */
export interface VirtualBench {
    step_id: Steps;
    form_control_raw: Record<string, unknown>;
}
