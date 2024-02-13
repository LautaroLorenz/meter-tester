import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { Step } from '../../models/step.model';
import {
  EssayTemplateStep,
  EssayTemplateStepTableColumns,
} from '../../models/essay-template-step.model';

@Component({
  selector: 'app-steps-sequence-table',
  templateUrl: './steps-sequence-table.component.html',
  styleUrls: ['./steps-sequence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsSequenceTableComponent implements OnChanges {
  @Input() stepOptions!: Step[];
  @Input() inputFormArray!: AbstractControl<any, any> | null;

  formArray!: FormArray<FormControl<Partial<EssayTemplateStep>>>;

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputFormArray) {
      this.formArray = changes.inputFormArray.currentValue as FormArray<
        FormControl<Partial<EssayTemplateStep>>
      >;
    }
  }

  addEssayTemplateStepControl(step: Step): void {
    const essayTemplateStep: Partial<EssayTemplateStep> = {
      step_id: step.id,
      actions_raw_data: [],
      foreign: {
        step: { ...step },
      },
    };
    this.formArray.push(
      this.fb.control(essayTemplateStep, { nonNullable: true })
    );
    this.recalculateEssayTemplateStepsOrder();
  }

  deleteEssayTemplateStepControl(index: number): void {
    this.formArray.removeAt(index);
    this.recalculateEssayTemplateStepsOrder();
  }

  private recalculateEssayTemplateStepsOrder(): void {
    this.formArray.controls.forEach((control, index) => {
      control.setValue({
        ...control.value,
        order: index + 1,
      });
    });
  }
}
