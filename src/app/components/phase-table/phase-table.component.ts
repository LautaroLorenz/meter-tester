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

    /**
     * En versiones viejas no se podia apagar una fase, por lo que si la key isActive no existe, 
     * se considera que la fase está activa.
     * Solo esta inactiva cunado la propiedad isActive es false.
     */
    isPhaseActive(phase: Phase | Partial<Phase> | undefined): boolean {
        return phase?.isActive === true || (!!phase && !('isActive' in phase));
    }

    getPhaseHeaderClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center bg-gray-100 text-gray-700 font-medium text-xs uppercase tracking-wide'
            : 'text-center bg-gray-50 text-gray-400 font-medium text-xs uppercase tracking-wide';
    }

    getPhaseCellClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center text-gray-700 font-medium bg-white'
            : 'text-center text-gray-400 font-medium bg-gray-25';
    }

    getPhaseCellStyles(): string {
        return 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem; white-space: nowrap;';
    }

    getSubHeaderClass(phase: Phase | Partial<Phase> | undefined): string {
        return this.isPhaseActive(phase)
            ? 'text-center bg-gray-100 text-gray-600 font-medium text-xs uppercase tracking-wider'
            : 'text-center bg-gray-100 text-gray-400 font-medium text-xs uppercase tracking-wider';
    }

    shouldShowValue(phase: Phase | Partial<Phase> | undefined, field: 'voltage' | 'current' | 'powerFactor'): boolean {
        const isActive = this.isPhaseActive(phase);

        if (!isActive) return false;

        // Verificar si el campo tiene un valor válido
        if (field === 'voltage') {
            return phase?.voltage !== undefined && phase.voltage !== null && phase.voltage !== 0;
        } else if (field === 'current') {
            return phase?.current !== undefined && phase.current !== null && phase.current !== 0;
        } else if (field === 'powerFactor') {
            return phase?.powerFactor !== undefined && phase.powerFactor !== null && phase.powerFactor !== 0;
        }

        return false;
    }

    getDisplayValue(phase: Phase | Partial<Phase> | undefined, field: 'voltage' | 'current' | 'powerFactor'): string {
        if (this.shouldShowValue(phase, field)) {
            if (field === 'voltage') {
                return `${(phase?.voltage || 0).toFixed(1)}[V]`;
            } else if (field === 'current') {
                return `${(phase?.current || 0).toFixed(3)}[A]`;
            } else if (field === 'powerFactor') {
                return `${(phase?.powerFactor || 0).toFixed(2)}${phase?.powerFactorLetter || ''}`;
            }
        }
        return '--';
    }
}
