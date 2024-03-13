import { Injectable } from '@angular/core';
import { MajorSteps } from '../models/business/enums/major-steps.model';
import { StepStatus } from '../models/business/enums/step-status.model';
import { RunEssayForm } from '../models/business/interafces/run-essay.model';
import { MajorStepsDirector } from '../models/business/class/major-steps.model';
import { EssayStep } from '../models/business/interafces/essay-step.model';
import { StepsBuilder } from '../models/business/class/steps-form-array-builder.model';
import { FormArray, FormBuilder } from '@angular/forms';
import { AbstractFormGroup } from '../models/core/abstract-form-group.model';
import { EssayTemplateStep } from '../models/business/database/essay-template-step.model';

@Injectable({
  providedIn: 'root',
})
export class RunEssayService {
  marjorStepStatus!: Record<MajorSteps, StepStatus>;
  runEssayForm!: RunEssayForm;

  constructor(private readonly fb: FormBuilder) {}

  buildSteps(essayTemplateSteps: EssayTemplateStep[]): void {
    StepsBuilder.buildEssaySteps(
      this.fb,
      this.runEssayForm.get('essaySteps') as FormArray<
        AbstractFormGroup<EssayStep>
      >,
      essayTemplateSteps
    );
  }

  reset(): void {
    this.marjorStepStatus = MajorStepsDirector.getStatus(
      this.runEssayForm.getRawValue().essaySteps as EssayStep[]
    );
  }
}
