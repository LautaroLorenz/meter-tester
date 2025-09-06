import { PatternStatus } from './../../../../../models/business/interafces/pattern-status.model';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PatternStatusRow } from '../../models/pattern-status-row.model';
import { Phase } from '../../../../../models/business/interafces/phase.model';

@Component({
    selector: 'app-pattern-status',
    templateUrl: './pattern-status.component.html',
    styleUrls: ['./pattern-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternStatusComponent implements OnChanges {
    @Input() patternStatus: PatternStatus | null = null;

    rows: PatternStatusRow[] = [
        { metric: 'Tensión U', l1: 0, l2: 0, l3: 0, unit: 'V', decimals: 1 },
        { metric: 'Corriente I', l1: 0, l2: 0, l3: 0, unit: 'A', decimals: 3 },
        { metric: 'Ángulo ɸ', l1: 0, l2: 0, l3: 0, unit: 'º', decimals: 1 }
    ];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.patternStatus) {
            this.rows = this.updateRows();
        }
    }

    // construye el formato del pipe number según dp
    getFormat(row: PatternStatusRow): string {
        return `1.${row.decimals}-${row.decimals}`;
    }

    private updateRows(): PatternStatusRow[] {
        const updateRow = (
            row: PatternStatusRow,
            phaseProp: keyof Phase,
            phaseL1: Phase | undefined,
            phaseL2: Phase | undefined,
            phaseL3: Phase | undefined
        ): PatternStatusRow => {
            return {
                ...row,
                l1: phaseL1 ? phaseL1[phaseProp] : 0,
                l2: phaseL2 ? phaseL2[phaseProp] : 0,
                l3: phaseL3 ? phaseL3[phaseProp] : 0
            };
        };

        return [
            updateRow(
                this.rows[0],
                'voltage',
                this.patternStatus?.phaseL1,
                this.patternStatus?.phaseL2,
                this.patternStatus?.phaseL3
            ),
            updateRow(
                this.rows[1],
                'current',
                this.patternStatus?.phaseL1,
                this.patternStatus?.phaseL2,
                this.patternStatus?.phaseL3
            ),
            updateRow(
                this.rows[2],
                'anglePhi',
                this.patternStatus?.phaseL1,
                this.patternStatus?.phaseL2,
                this.patternStatus?.phaseL3
            )
        ];
    }
}
