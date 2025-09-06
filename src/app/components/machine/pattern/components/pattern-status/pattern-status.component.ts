import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PatternStatusRow } from '../../models/pattern-status-row.model';
import { PatternStatus } from '../../../../../models/business/interafces/pattern-status.model';

@Component({
    selector: 'app-pattern-status',
    templateUrl: './pattern-status.component.html',
    styleUrls: ['./pattern-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternStatusComponent {
    @Input() patternStatus: PatternStatus | null = null;

    rows: PatternStatusRow[] = [
        { metric: 'Tensión U', l1: 0, l2: 0, l3: 0, unit: 'V', decimals: 1 },
        { metric: 'Corriente I', l1: 0, l2: 0, l3: 0, unit: 'A', decimals: 3 },
        { metric: 'Ángulo ɸ', l1: 0, l2: 0, l3: 0, unit: 'º', decimals: 1 }
    ];

    // construye el formato del pipe number según dp
    getFormat(row: PatternStatusRow): string {
        return `1.${row.decimals}-${row.decimals}`;
    }
}
