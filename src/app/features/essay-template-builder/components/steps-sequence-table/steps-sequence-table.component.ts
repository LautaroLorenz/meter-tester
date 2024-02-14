import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  @Input() savedEssayTemplateSteps: EssayTemplateStep[] | undefined;

  formArray!: FormArray<FormControl<Partial<EssayTemplateStep>>>;

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputFormArray) {
      this.formArray = changes.inputFormArray.currentValue as FormArray<
        FormControl<Partial<EssayTemplateStep>>
      >;
    }
    if (
      changes.savedEssayTemplateSteps &&
      changes.savedEssayTemplateSteps.currentValue
    ) {
      this.addSavedEssayTemplateStepsControl(
        changes.savedEssayTemplateSteps.currentValue as EssayTemplateStep[]
      );
    }
  }

  addEssayTemplateStepControlByStep(step: Step): void {
    const essayTemplateStep: Partial<EssayTemplateStep> = {
      step_id: step.id,
      actions_raw_data: [],
      foreign: {
        step: { ...step },
      },
    };
    this.addEssayTemplateStepControl(essayTemplateStep);
    this.formArray.markAsDirty();
  }

  deleteEssayTemplateStepControl(index: number): void {
    this.formArray.removeAt(index);
    this.recalculateEssayTemplateStepsOrder();
    this.formArray.markAsDirty();
  }

  moveDownByIndex(indexFrom: number): void {
    if (indexFrom === null) {
      return;
    }
    if (indexFrom === this.formArray.length - 1) {
      return;
    }
    const indexTo = indexFrom + 1;
    const temp = this.formArray.at(indexFrom);
    this.formArray.removeAt(indexFrom);
    this.formArray.insert(indexTo, temp);
    this.recalculateEssayTemplateStepsOrder();
    this.formArray.markAsDirty();
  }

  moveUpByIndex(indexFrom: number): void {
    if (indexFrom === null) {
      return;
    }
    if (indexFrom === 0) {
      return;
    }
    const indexTo = indexFrom - 1;
    const temp = this.formArray.at(indexFrom);
    this.formArray.removeAt(indexFrom);
    this.formArray.insert(indexTo, temp);
    this.recalculateEssayTemplateStepsOrder();
    this.formArray.markAsDirty();
  }

  private recalculateEssayTemplateStepsOrder(): void {
    this.formArray.controls.forEach((control, index) => {
      control.setValue({
        ...control.value,
        order: index + 1,
      });
    });
  }

  private addSavedEssayTemplateStepsControl(
    essayTemplateSteps: EssayTemplateStep[]
  ): void {
    essayTemplateSteps.forEach((essayTemplateStep) =>
      this.addEssayTemplateStepControl(essayTemplateStep)
    );
  }

  private addEssayTemplateStepControl(
    essayTemplateStep: EssayTemplateStep | Partial<EssayTemplateStep>
  ): void {
    this.formArray.push(
      this.fb.control(essayTemplateStep, { nonNullable: true })
    );
    this.recalculateEssayTemplateStepsOrder();
  }
}
