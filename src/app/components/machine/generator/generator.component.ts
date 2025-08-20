import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { APP_CONFIG } from '../../../../environments/environment';
import { GeneratorEnum } from '../../../models/business/enums/generator-enum.model';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratorComponent<T extends EssayTemplateStep> implements OnInit {
    @Input() currentStep!: T;
    @Output() adjustmentDone = new EventEmitter<void>();

    isAdjusted = false;

    ngOnInit(): void {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }
        this.skip();
    }

    resetConfirmation(): void {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }
    }

    private skip(): void {
        if (!APP_CONFIG.skipSteps.generatorAdjusted) {
            return;
        }

        setTimeout(() => {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }, 500);
    }
}
