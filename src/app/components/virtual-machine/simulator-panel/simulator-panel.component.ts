import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { SimulatorService } from '../../../services/simulator.service';
import {
    SIMULATED_STEP_BY_STEP_ID,
    SIMULATED_STEP_TYPES,
    SIMULATED_VALUE_UNITS,
    SIMULATOR_SCENARIOS,
    SimulatedOutcome,
    SimulatedStepSetting,
    SimulatedStepType,
    SimulatorScenario,
    SimulatorState
} from '../../../models/business/interafces/simulator.model';

interface SimulatorCell {
    stepType: SimulatedStepType;
    setting: SimulatedStepSetting;
    options: Array<{ label: string; value: SimulatedOutcome }>;
    effective: string;
}

interface SimulatorRow {
    stand: number;
    cells: SimulatorCell[];
}

interface SimulatorView {
    state: SimulatorState;
    runningStep?: SimulatedStepType;
    rows: SimulatorRow[];
}

const STEP_LABELS: Record<SimulatedStepType, string> = {
    vacuum: 'Vacío',
    contrast: 'Contraste',
    boot: 'Arranque',
    integration: 'Integración'
};

/**
 * Panel "Escenario" de la máquina virtual: elige cómo responden los medidores simulados.
 */
@Component({
    selector: 'app-simulator-panel',
    templateUrl: './simulator-panel.component.html',
    styleUrls: ['./simulator-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatorPanelComponent {
    readonly scenarios = SIMULATOR_SCENARIOS;
    readonly stepTypes = SIMULATED_STEP_TYPES;
    readonly stepLabels = STEP_LABELS;
    readonly units = SIMULATED_VALUE_UNITS;
    readonly outcomes: Record<SimulatedStepType, Array<{ label: string; value: SimulatedOutcome }>> = {
        vacuum: this.outcomeOptions('Aprueba'),
        contrast: this.outcomeOptions('Aprueba'),
        boot: this.outcomeOptions('Aprueba'),
        // en integración el resultado lo dan los integradores: el medidor solo completa los impulsos
        integration: [
            { label: 'Por defecto (3 s)', value: 'aprueba' },
            { label: 'Valor', value: 'valor' }
        ]
    };

    readonly view$: Observable<SimulatorView> = combineLatest([this.simulator.state$, this.simulator.bench$]).pipe(
        map(([state, bench]) => {
            const runningStep = bench ? SIMULATED_STEP_BY_STEP_ID[bench.step_id] : undefined;
            const rows = state.meters.map((meter, index) => {
                const stand = index + 1;
                return {
                    stand,
                    cells: SIMULATED_STEP_TYPES.map((stepType) => ({
                        stepType,
                        setting: meter[stepType],
                        options: this.outcomes[stepType],
                        effective: stepType === runningStep ? this.effective(stand, stepType) : ''
                    }))
                };
            });
            return { state, runningStep, rows };
        })
    );

    constructor(private readonly simulator: SimulatorService) {}

    setScenario(scenario: SimulatorScenario): void {
        this.simulator.setScenario(scenario);
    }

    setOutcome(stand: number, cell: SimulatorCell, outcome: SimulatedOutcome): void {
        this.simulator.setStand(stand, cell.stepType, { outcome, value: cell.setting.value ?? null });
    }

    setValue(stand: number, cell: SimulatorCell, value: number | null): void {
        this.simulator.setStand(stand, cell.stepType, { outcome: 'valor', value });
    }

    trackByStand(_: number, row: SimulatorRow): number {
        return row.stand;
    }

    private effective(stand: number, stepType: SimulatedStepType): string {
        const value = this.simulator.resolve(stand, stepType);
        switch (stepType) {
            case 'vacuum':
                return `${value ?? 0} imp`;
            case 'contrast':
                return `${(value ?? 0).toFixed(2)} %`;
            default:
                return value === null ? 'no arranca' : `${value} s`;
        }
    }

    private outcomeOptions(approveLabel: string): Array<{ label: string; value: SimulatedOutcome }> {
        return [
            { label: approveLabel, value: 'aprueba' },
            { label: 'Falla', value: 'falla' },
            { label: 'Valor', value: 'valor' }
        ];
    }
}
