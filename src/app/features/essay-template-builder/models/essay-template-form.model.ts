import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EssayTemplateStep } from './essay-template-step.model';

export interface EssayTemplateForm {
  essayTemplate: FormGroup<any>;
  essayTemplateSteps: FormArray<FormControl<EssayTemplateStep>>;
}
