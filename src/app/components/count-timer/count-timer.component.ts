import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-count-timer',
  templateUrl: './count-timer.component.html',
  styleUrls: ['./count-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountTimerComponent implements OnDestroy, OnChanges {
  @Input() durationSeconds!: number;

  @Output() finishCount = new EventEmitter<void>();

  timer!: NodeJS.Timer;
  isRunning!: boolean;
  countdownDown$: BehaviorSubject<number>;

  constructor() {
    this.countdownDown$ = new BehaviorSubject(0);
  }

  get currentSecond(): number {
    return this.durationSeconds - this.countdownDown$.value;
  }

  get percentage(): number {
    return (this.currentSecond * 100) / this.durationSeconds;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.durationSeconds) {
      this.reset();
    }
  }

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.timer = setInterval(() => {
      if (this.countdownDown$.value > 1) {
        this.countdownDown$.next(this.countdownDown$.value - 1);
      } else {
        this.countdownDown$.next(0);
        this.stop();
        this.finishCount.emit();
      }
    }, 1000);
  }

  stop(): void {
    clearInterval(this.timer);
    this.isRunning = false;
  }

  reset() {
    this.countdownDown$.next(this.durationSeconds);
  }

  ngOnDestroy() {
    this.stop();
  }
}
