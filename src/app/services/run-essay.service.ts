import { Injectable } from '@angular/core';
import { MajorSteps } from '../models/business/enums/major-steps.model';
import { StepStatus } from '../models/business/enums/step-status.model';
import { RunEssayForm } from '../models/business/interafces/run-essay.model';
import { MajorStepsDirector } from '../models/business/class/major-steps-director.model';
import { EssayStep } from '../models/business/interafces/essay-step.model';
import { StepsBuilder } from '../models/business/class/steps-form-array-builder.model';
import { FormArray, FormBuilder } from '@angular/forms';
import { AbstractFormGroup } from '../models/core/abstract-form-group.model';
import { EssayTemplateStep } from '../models/business/database/essay-template-step.model';
import { BehaviorSubject } from 'rxjs';
import { StandResult } from '../models/business/interafces/stand-result.model';

@Injectable({
  providedIn: 'root',
})
export class RunEssayService {
  majorStepStatusMap$!: BehaviorSubject<Record<MajorSteps, StepStatus>>;

  private essaySteps!: FormArray<AbstractFormGroup<EssayStep>>;
  private _runEssayForm!: RunEssayForm;

  constructor(private readonly fb: FormBuilder) {}

  get runEssayForm(): RunEssayForm {
    return this._runEssayForm;
  }

  set runEssayForm(value: RunEssayForm) {
    this.essaySteps = value.get('essaySteps') as FormArray<
      AbstractFormGroup<EssayStep>
    >;
    this._runEssayForm = value;
  }

  buildSteps(essayTemplateSteps: EssayTemplateStep[]): void {
    StepsBuilder.buildEssaySteps(
      this.fb,
      this.runEssayForm.get('essaySteps') as FormArray<
        AbstractFormGroup<EssayStep>
      >,
      essayTemplateSteps
    );
  }

  inferOptionalStepsProps(): void {
    const essaySteps = this.runEssayForm.getRawValue()
      .essaySteps as EssayStep[];
    const verificationSteps = MajorStepsDirector.stepsByMajorStep(
      essaySteps,
      MajorSteps.Verification
    );

    // verificar si todos los steps tienen name y si no tienen asignarles uno.
    verificationSteps.forEach((essayStep) => {
      if (
        'name' in essayStep.form_control_raw &&
        !essayStep.form_control_raw.name &&
        essayStep.foreign.step?.name
      ) {
        this.getEssayStep(essayStep.id)
          .get('form_control_raw.name')
          ?.setValue(essayStep.foreign.step.name);
      }
    });
  }

  reset(): void {
    this.majorStepStatusMap$ = new BehaviorSubject(
      MajorStepsDirector.getMajorStepStatusMap(
        this.runEssayForm.getRawValue().essaySteps as EssayStep[]
      )
    );
  }

  getEssayStep(essayStepId: number): AbstractFormGroup<EssayStep> {
    const essayStepsRaw = this.runEssayForm.getRawValue()
      .essaySteps as EssayStep[];
    const stepIndex = essayStepsRaw?.findIndex(({ id }) => essayStepId === id);
    return this.essaySteps.at(stepIndex);
  }

  getEssayStandResult(
    essayStepId: number,
    standIndex: number
  ): AbstractFormGroup<StandResult> {
    const essayStep = this.getEssayStep(essayStepId);
    return (essayStep.get('standResults') as FormArray).at(
      standIndex
    ) as AbstractFormGroup<StandResult>;
  }

  nextMajorStep(): void {
    this.majorStepStatusMap$.next(
      MajorStepsDirector.getMajorStepStatusMap(
        this.runEssayForm.getRawValue().essaySteps as EssayStep[]
      )
    );
  }
}
