import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Meter } from '../../../models/business/database/meter.model';

@Component({
    selector: 'app-meter-detail',
    templateUrl: './meter-detail.component.html',
    styleUrls: ['./meter-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeterDetailComponent {
    @Input() meter!: Meter;
}
