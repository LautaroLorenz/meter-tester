import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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

  @Output() stopped = new EventEmitter<void>();
  @Output() finishCount = new EventEmitter<void>();

  timer!: NodeJS.Timer;
  isRunning!: boolean;
  countdownDown$: BehaviorSubject<number>;

  constructor(private readonly cd: ChangeDetectorRef) {
    this.countdownDown$ = new BehaviorSubject(0);
  }

  get currentSecond(): number {
    return this.durationSeconds - this.countdownDown$.value;
  }

  get percentage(): number {
    return (this.currentSecond * 100) / this.durationSeconds;
  }

  get timerStatus(): 'No iniciado' | 'Detenido' | 'Contando' | 'Finalizado' {
    if (this.isRunning) {
      return 'Contando';
    } else {
      if (this.currentSecond === 0) {
        return 'No iniciado';
      }
      if (this.currentSecond < this.durationSeconds) {
        return 'Detenido';
      } else {
        return 'Finalizado';
      }
    }
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
        this.cd.detectChanges();
      }
    }, 1000);
  }

  stop(): void {
    clearInterval(this.timer);
    this.isRunning = false;
    this.cd.detectChanges();
  }

  reset() {
    this.countdownDown$.next(this.durationSeconds);
  }

  ngOnDestroy() {
    this.stop();
  }
}
