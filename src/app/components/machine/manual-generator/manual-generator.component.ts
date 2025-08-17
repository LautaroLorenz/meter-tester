import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { APP_CONFIG } from '../../../../environments/environment';
import { AwaitUserConfirmComponent } from '../../await-user-confirm/await-user-confirm.component';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';

@Component({
    selector: 'app-manual-generator',
    templateUrl: './manual-generator.component.html',
    styleUrls: ['./manual-generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualGeneratorComponent<T extends EssayTemplateStep> implements OnInit {
    @Input() currentStep!: T;
    @Output() adjustmentDone = new EventEmitter<void>();
    @ViewChild('awaitUserConfirm', { static: true }) awaitUserConfirm!: AwaitUserConfirmComponent;

    ngOnInit(): void {
        this.skip();
    }

    resetConfirmation(): void {
        this.awaitUserConfirm.resetConfirmation();
    }

    private skip(): void {
        if (!APP_CONFIG.skipSteps.manualGeneratorConfirm) {
            return;
        }

        setTimeout(() => {
            this.adjustmentDone.emit();
        }, 500);
    }
}
