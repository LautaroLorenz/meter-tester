import { PreparationFormBuilder } from '../interafces/steps/preparation-step.model';
import { VacuumTestFormBuilder } from '../interafces/steps/vacuum-step.model';
import { ContrastTestFormBuilder } from '../interafces/steps/contrast-test-step.model';
import { BootTestFormBuilder } from '../interafces/steps/boot-test-step.model';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { Steps } from '../enums/steps.model';
import { FormBuilder } from '@angular/forms';

export class BuilderByStepId {
  private static initialized = false;

  // step builders
  private static readonly PreparationFormBuilder = new PreparationFormBuilder();
  private static readonly VacuumTestFormBuilder = new VacuumTestFormBuilder();
  private static readonly ContrastTestFormBuilder =
    new ContrastTestFormBuilder();
  private static readonly BootTestFormBuilder = new BootTestFormBuilder();

  static build<T extends EssayTemplateStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T> {
    if (!this.initialized) {
      this.initBuilder();
      this.initialized = true;
    }

    return this.PreparationFormBuilder.build(fb, stepType);
  }

  private static initBuilder(): void {
    this.PreparationFormBuilder.setNext(this.VacuumTestFormBuilder)
      .setNext(this.ContrastTestFormBuilder)
      .setNext(this.BootTestFormBuilder);
  }
}
