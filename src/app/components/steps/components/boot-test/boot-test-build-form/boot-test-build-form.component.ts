import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildForm } from '../../../models/step-build-form.model';

@Component({
  selector: 'app-boot-test-build-form',
  templateUrl: './boot-test-build-form.component.html',
  styleUrls: ['./boot-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestBuildFormComponent implements StepBuildForm {}
