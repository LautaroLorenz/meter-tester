import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CBVariableTypes } from '../../../../models/business/enums/command-variable-block-config.model';

@Component({
  selector: 'app-vm-calculator',
  templateUrl: './vm-calculator.component.html',
  styleUrls: ['./vm-calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmCalculatorComponent {
  @Output() write = new EventEmitter<string>();

  readonly CBVariableTypes = CBVariableTypes;
}
