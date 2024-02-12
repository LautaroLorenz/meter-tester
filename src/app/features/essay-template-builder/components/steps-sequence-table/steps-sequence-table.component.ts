import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
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
export class StepsSequenceTableComponent implements ControlValueAccessor {
  @Input() stepOptions!: Step[];

  value: EssayTemplateStep[] = [];

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;

  onChange: ((...args: any) => any) | undefined = undefined;
  onTouched: ((...args: any) => any) | undefined = undefined;

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  writeValue(value: EssayTemplateStep[]): void {
    this.setValue(value, false);
  }

  setValue(value: EssayTemplateStep[], emitEvent = true): void {
    this.value = value;

    if (emitEvent && this.onChange) {
      this.onChange(value);
    }
  }
}
