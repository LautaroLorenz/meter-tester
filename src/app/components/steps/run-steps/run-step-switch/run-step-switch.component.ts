import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { EssayStep } from '../../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { timer } from 'rxjs';

@Component({
  selector: 'app-run-step-switch',
  templateUrl: './run-step-switch.component.html',
  styleUrls: ['./run-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunStepSwitchComponent implements OnChanges {
  @Input() currentStepId!: number;
  @Input() currentStep!: EssayStep;
  @Input() preparationStep!: EssayStep;

  reloaded = true;
  readonly Steps = Steps;
  readonly cd = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStepId) {
      timer(0).subscribe(() => this.forceReloadStepComponent());
    }
  }

  private forceReloadStepComponent(): void {
    this.reloaded = false;
    this.cd.markForCheck();
    timer(0).subscribe(() => {
      this.reloaded = true;
      this.cd.detectChanges();
    });
  }
}
