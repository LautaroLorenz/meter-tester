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
        { metric: 'Upn', l1: 220.01, l2: 220.0, l3: 220.0, unit: 'V', dp: 2 },
        { metric: 'Upp', l1: 381.02, l2: 381.07, l3: 381.04, unit: 'V', dp: 2 },
        { metric: 'I', l1: 0.0003, l2: 4.9995, l3: 5.0, unit: 'A', dp: 4 },
        { metric: '<U', l1: 120.0, l2: 0.0, l3: 240.0, unit: '°', dp: 2 },
        { metric: '<I', l1: 298.2, l2: 0.0, l3: 240.0, unit: '°', dp: 2 },
        { metric: '<IU', l1: 181.8, l2: 0.0, l3: 0.0, unit: '°', dp: 2 },
        { metric: 'PF', l1: -0.9995, l2: 1.0, l3: 1.0, unit: '', dp: 4 },
        { metric: 'P', l1: -0.0001, l2: 1.0999, l3: 1.1, unit: 'kW', dp: 4 },
        { metric: 'Q', l1: -0.0, l2: 0.0, l3: 0.0, unit: 'kVAr', dp: 4 }
    ];

    // construye el formato del pipe number según dp
    getFormat(r: PatternStatusRow): string {
        return `1.${r.dp}-${r.dp}`;
    }
}
