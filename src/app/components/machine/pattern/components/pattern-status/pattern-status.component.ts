import { PatternStatus } from './../../../../../models/business/interafces/pattern-status.model';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PatternStatusRow } from '../../models/pattern-status-row.model';
import { Phase } from '../../../../../models/business/interafces/phase.model';
import { MeterConstantEnum } from '../../../../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-pattern-status',
    templateUrl: './pattern-status.component.html',
    styleUrls: ['./pattern-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternStatusComponent implements OnChanges {
    @Input() patternStatus: PatternStatus | null = null;
    @Input() meterConstant: MeterConstantEnum | null = null;

    rows: PatternStatusRow[] = [
        { metric: 'Tensión U', l1: 0, l2: 0, l3: 0, unit: 'V', decimals: 1 },
        { metric: 'Corriente I', l1: 0, l2: 0, l3: 0, unit: 'A', decimals: 3 },
        { metric: 'Factor de potencia', l1: 0, l2: 0, l3: 0, unit: '', decimals: 2 }
    ];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.patternStatus || changes.meterConstant) {
            this.rows = this.updateRows();
        }
    }

    // construye el formato del pipe number según dp
    getFormat(row: PatternStatusRow): string {
        return `1.${row.decimals}-${row.decimals}`;
    }

    private updateRows(): PatternStatusRow[] {
        const updatePhaseRow = (
            row: PatternStatusRow,
            phaseProp: 'voltage' | 'current' | 'anglePhi' | 'powerFactor',
            phaseL1: Phase | undefined,
            phaseL2: Phase | undefined,
            phaseL3: Phase | undefined,
            includeLetters = false
        ): PatternStatusRow => {
            const updatedRow: PatternStatusRow = {
                ...row,
                l1: phaseL1 ? phaseL1[phaseProp] : 0,
                l2: phaseL2 ? phaseL2[phaseProp] : 0,
                l3: phaseL3 ? phaseL3[phaseProp] : 0
            };

            // Si se requieren letras (para factor de potencia), agregarlas
            if (includeLetters) {
                updatedRow.l1Letter = phaseL1?.powerFactorLetter;
                updatedRow.l2Letter = phaseL2?.powerFactorLetter;
                updatedRow.l3Letter = phaseL3?.powerFactorLetter;
            }

            return updatedRow;
        };

        // Update power factor row with appropriate text based on meter constant
        const powerFactorRow = updatePhaseRow(
            this.rows[2],
            'powerFactor',
            this.patternStatus?.phaseL1,
            this.patternStatus?.phaseL2,
            this.patternStatus?.phaseL3,
            true // Incluir letras para el factor de potencia
        );

        // Update the metric text based on meter constant
        if (this.meterConstant === MeterConstantEnum.Active) {
            powerFactorRow.metric = 'Cos de Phi';
        } else if (this.meterConstant === MeterConstantEnum.Reactive) {
            powerFactorRow.metric = 'Sen de Phi';
        } else {
            powerFactorRow.metric = 'Factor de potencia';
        }

        return [
            updatePhaseRow(
                this.rows[0],
                'voltage',
                this.patternStatus?.phaseL1,
                this.patternStatus?.phaseL2,
                this.patternStatus?.phaseL3
            ),
            updatePhaseRow(
                this.rows[1],
                'current',
                this.patternStatus?.phaseL1,
                this.patternStatus?.phaseL2,
                this.patternStatus?.phaseL3
            ),
            powerFactorRow
        ];
    }
}
