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
import { Step } from '../../../../models/business/database/step.model';
import {
  EssayTemplateStep,
  EssayTemplateStepTableColumns,
} from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { ConfirmationService, PrimeIcons } from 'primeng/api';

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
  selectedEssayTemplateStepToEdit: {
    step: EssayTemplateStep | undefined;
    index: number | undefined;
  } = {
    step: undefined,
    index: undefined,
  };

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {}

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
    if (changes.stepOptions) {
      setTimeout(() => {
        this.addDefaultEssayTemplateStepsControl(
          changes.stepOptions.currentValue as Step[]
        );
        this.cd.detectChanges();
      });
    }
  }

  addEssayTemplateStepControlByStep(
    step: Step,
    { markForCheck } = { markForCheck: true }
  ): void {
    const essayTemplateStep: Partial<EssayTemplateStep> = {
      step_id: step.id,
      foreign: {
        step: { ...step },
      },
    };
    this.addEssayTemplateStepControl(essayTemplateStep);

    if (markForCheck) {
      this.formArray.markAsDirty();
    }
  }

  deleteEssayTemplateStepControl(index: number): void {
    this.confirmationService.confirm({
      message: '¿Eliminar fila de la tabla?',
      header: 'Confirmar borrado',
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.formArray.removeAt(index);
        this.recalculateEssayTemplateStepsOrder();
        this.formArray.markAsDirty();
        this.cd.detectChanges();
      },
    });
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

  editEssayTemplateStep(
    essayTemplateStep: EssayTemplateStep,
    stepIndex: number
  ): void {
    this.selectedEssayTemplateStepToEdit.step = essayTemplateStep;
    this.selectedEssayTemplateStepToEdit.index = stepIndex;
  }

  editStepInSequenceDialogHide(): void {
    this.selectedEssayTemplateStepToEdit.step = undefined;
    this.selectedEssayTemplateStepToEdit.index = undefined;
  }

  saveEditedStepInSequenceChanges(
    essayTemplateStep: Partial<EssayTemplateStep>
  ): void {
    if (this.selectedEssayTemplateStepToEdit.index === undefined) {
      return;
    }
    this.formArray
      .at(this.selectedEssayTemplateStepToEdit.index)
      .patchValue(essayTemplateStep);
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
    this.formArray.clear();
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

  private addDefaultEssayTemplateStepsControl(steps: Step[]): void {
    if (!steps) {
      return;
    }
    if (this.formArray.length > 0) {
      return;
    }
    const defaultEssayTemplateSteps = steps.filter((step) =>
      [Steps.Preparation].includes(step.id)
    );
    defaultEssayTemplateSteps.forEach((step) =>
      this.addEssayTemplateStepControlByStep(step, { markForCheck: false })
    );
  }
}
