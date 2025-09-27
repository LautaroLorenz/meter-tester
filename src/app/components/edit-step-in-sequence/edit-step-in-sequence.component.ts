import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EssayTemplateStep } from '../../models/business/database/essay-template-step.model';
import { EditDialogComponent } from '../../models/core/edit-dialog.model';
import { HelpTextStepsMap } from '../../models/business/constants/help-texts-constant.model';
import { Steps } from '../../models/business/enums/steps.model';

@Component({
    selector: 'app-edit-step-in-sequence',
    templateUrl: './edit-step-in-sequence.component.html',
    styleUrls: ['./edit-step-in-sequence.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditStepInSequenceComponent extends EditDialogComponent<EssayTemplateStep> {
    readonly HelpTextStepsMap = HelpTextStepsMap;

    getHelpTextTitle(stepId: number): string {
        return HelpTextStepsMap[stepId as Steps]?.title || '';
    }

    getHelpTextMessage(stepId: number): string {
        return HelpTextStepsMap[stepId as Steps]?.message || '';
    }
}
