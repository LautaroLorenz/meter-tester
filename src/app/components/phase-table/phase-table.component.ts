import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Phase } from '../../models/business/interafces/phase.model';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-phase-table',
    templateUrl: './phase-table.component.html',
    styleUrls: ['./phase-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhaseTableComponent {
    @Input() showTexts!: boolean;
    @Input() phaseL1: Phase | Partial<Phase> | undefined;
    @Input() phaseL2: Phase | Partial<Phase> | undefined;
    @Input() phaseL3: Phase | Partial<Phase> | undefined;
    @Input() meterConstantEnum: MeterConstantEnum | undefined;

    getPowerFactorPrefix(): string {
        if (this.meterConstantEnum === MeterConstantEnum.Active) {
            return 'Cos';
        } else if (this.meterConstantEnum === MeterConstantEnum.Reactive) {
            return 'Sen';
        }
        return 'FP';
    }

    isPhaseActive(phase: Phase | Partial<Phase> | undefined): boolean {
        return phase?.isActive === true;
    }

    getPhaseHeaderClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center bg-gray-100 text-gray-700 font-medium text-sm uppercase tracking-wide'
            : 'text-center bg-gray-50 text-gray-400 font-medium text-sm uppercase tracking-wide';
    }

    getPhaseCellClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center text-gray-700 font-medium text-sm font-mono bg-white'
            : 'text-center text-gray-400 font-medium text-sm font-mono bg-gray-25';
    }

    getSubHeaderClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center bg-gray-100 text-gray-600 font-medium text-xs uppercase tracking-wider'
            : 'text-center bg-gray-100 text-gray-400 font-medium text-xs uppercase tracking-wider';
    }
}
