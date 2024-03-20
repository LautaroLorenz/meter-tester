import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-major-step-timeline',
  templateUrl: './major-step-timeline.component.html',
  styleUrls: ['./major-step-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepTimelineComponent implements OnInit, OnDestroy {
  readonly MajorSteps = MajorSteps;

  private readonly onDestroy = new Subject<void>();

  constructor(
    private readonly runEssayService: RunEssayService,
    private readonly cd: ChangeDetectorRef
  ) {}

  get majorStepStatusMap$(): Observable<Record<MajorSteps, StepStatus>> {
    return this.runEssayService.majorStepStatusMap$;
  }

  get verificationSteps$(): Observable<EssayStep[]> {
    return this.runEssayService.verificationSteps$;
  }

  get executionSteps$(): Observable<EssayStep[]> {
    return this.runEssayService.executionSteps$;
  }

  ngOnInit(): void {
    this.runEssayService.currentStep$
      .pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
