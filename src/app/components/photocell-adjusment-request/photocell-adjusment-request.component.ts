import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { APP_CONFIG } from '../../../environments/environment';
import { GeneratorEnum } from '../../models/business/enums/generator-enum.model';

@Component({
    selector: 'app-photocell-adjusment-request',
    templateUrl: './photocell-adjusment-request.component.html',
    styleUrls: ['./photocell-adjusment-request.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotocellAdjusmentRequestComponent implements OnInit {
    @Input() meterConstant!: number;
    @Output() adjustmentDone = new EventEmitter<void>();

    readonly GeneratorEnum = GeneratorEnum;
    readonly generatorType = APP_CONFIG.generatorType;

    ngOnInit(): void {
        this.skip();
    }

    private skip(): void {
        if (!APP_CONFIG.skipSteps.photocellAdjustmentRequest) {
            return;
        }

        setTimeout(() => {
            this.adjustmentDone.emit();
        }, 250);
    }
}
