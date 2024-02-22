import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
import { PreparationStep } from '../models/preparation-step.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { APP_CONFIG } from '../../../../../../environments/environment';

@Component({
  selector: 'app-preparation-build-form',
  templateUrl: './preparation-build-form.component.html',
  styleUrls: ['./preparation-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationBuildFormComponent extends StepBuildFormComponent<PreparationStep> {
  override buildForm(fb: FormBuilder): AbstractFormGroup<PreparationStep> {
    // generate stand array based on APP_CONFIG variable
    const StandsGroupArray: FormGroup[] = Array(APP_CONFIG.standsQuantiy)
      .fill(undefined)
      .map((_, index) =>
        fb.nonNullable.group({
          index,
          isActive: false,
          meterId: undefined,
          serialNumber: undefined,
          yearOfProduction: undefined,
        })
      );

    return fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.array(StandsGroupArray),
      foreign: undefined,
    }) as AbstractFormGroup<PreparationStep>;
  }

  override observeTables(): void {
    // TODO
  }

  override requestToolsTables(): void {
    // TODO
  }
}
