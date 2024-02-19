import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EssayTemplateStep } from '../database/essay-template-step.model';

export interface EssayTemplateForm {
  id: FormControl<number | undefined>;
  name: FormControl<string | undefined>;
}

export interface EssayTemplateFormGroup {
  essayTemplate: FormGroup<EssayTemplateForm>;
  essayTemplateSteps: FormArray<FormControl<EssayTemplateStep>>;
}
