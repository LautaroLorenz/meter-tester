import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-phase-form-group',
  templateUrl: './phase-form-group.component.html',
  styleUrls: ['./phase-form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhaseFormGroupComponent {
  @Input() formGroup!: FormGroup;
  @Input() faseLabel!: string;
  @Input() voltageFormControlName!: string;
  @Input() voltageLabel!: string;
  @Input() currentFormControlName!: string;
  @Input() currentLabel!: string;
  @Input() angleFormControlName!: string;
  @Input() angleLabel!: string;
}
