import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { APP_CONFIG } from '../../../environments/environment';
import { GeneratorEnum } from '../../models/business/enums/generator-enum.model';
import { ConfirmationService } from 'primeng/api';
import { PrimeIcons } from 'primeng/api';

@Component({
    selector: 'app-photocell-adjusment-request',
    templateUrl: './photocell-adjusment-request.component.html',
    styleUrls: ['./photocell-adjusment-request.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotocellAdjusmentRequestComponent implements OnInit {
    @Input() meterConstant!: number;
    @Input() stepNumber!: number;
    @Output() adjustmentDone = new EventEmitter<void>();
    @Output() stepSkipped = new EventEmitter<void>();

    readonly GeneratorEnum = GeneratorEnum;
    readonly generatorType = APP_CONFIG.generatorType;

    private readonly confirmationService = inject(ConfirmationService);

    ngOnInit(): void {
        this.skip();
    }

    skipStep(): void {
        this.confirmationService.confirm({
            message: 'Al omitir la ejecución del paso, el mismo no se mostrará en el reporte.',
            header: 'Confirmar omitir ejecución de este paso',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            defaultFocus: 'reject',
            acceptButtonStyleClass: 'p-button-warning',
            accept: () => {
                this.stepSkipped.emit();
            }
        });
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
