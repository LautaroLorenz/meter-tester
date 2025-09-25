import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subject, takeUntil, map, combineLatest } from 'rxjs';
import { StandResult } from '../../models/business/interafces/stand-result.model';
import { ActiveStand } from '../../models/business/interafces/active-stand.model';

export interface ProgressStatus {
    status: 'waiting' | 'running' | 'completed';
    text: string;
    color: string;
}

@Component({
    selector: 'app-pulses-progress-bar',
    templateUrl: './pulses-progress-bar.component.html',
    styleUrls: ['./pulses-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PulsesProgressBarComponent implements OnInit, OnDestroy {
    @Input() visibility: 'visible' | 'hidden' = 'visible';
    @Input() targetPulses!: number;
    @Input() standResults$!: Observable<StandResult[]>;
    @Input() activeStands$!: Observable<ActiveStand[]>;
    @Input() isRunning$!: Observable<boolean>;

    readonly cd = inject(ChangeDetectorRef);

    // Progress tracking
    minPulsesCounted = 0;
    percentage = 0;
    progressStatus: ProgressStatus = {
        status: 'waiting',
        text: 'Esperando',
        color: '#6c757d'
    };

    private onDestroy$ = new Subject<void>();

    get color(): string {
        return this.progressStatus.color;
    }

    ngOnInit(): void {
        // Subscribe to stand results and active stands to calculate progress
        combineLatest([
            this.activeStands$.pipe(map((activeStands) => activeStands.map((stand) => stand.index))),
            this.standResults$
        ])
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(([activeStandIndexes, standResults]) => {
                this.calculateProgress(standResults, activeStandIndexes);
            });

        // Subscribe to running status to update progress status
        this.isRunning$.pipe(takeUntil(this.onDestroy$)).subscribe((isRunning) => {
            this.updateProgressStatus(isRunning);
        });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private calculateProgress(standResults: StandResult[], activeStandIndexes: number[]): void {
        if (activeStandIndexes.length === 0 || this.targetPulses <= 0) {
            this.minPulsesCounted = 0;
            this.percentage = 0;
            return;
        }

        // Get the minimum pulses counted among active stands
        let minPulses = Number.MAX_SAFE_INTEGER;

        for (const standIndex of activeStandIndexes) {
            const standResult = standResults.find((result) => result.standIndex === standIndex);
            if (standResult && 'measuredPulses' in standResult && standResult.measuredPulses !== undefined) {
                minPulses = Math.min(minPulses, standResult.measuredPulses as number);
            } else {
                // If any active stand has no measurement, progress is 0
                minPulses = 0;
                break;
            }
        }

        this.minPulsesCounted = minPulses === Number.MAX_SAFE_INTEGER ? 0 : minPulses;
        this.percentage = Math.min((this.minPulsesCounted / this.targetPulses) * 100, 100);

        this.cd.detectChanges();
    }

    private updateProgressStatus(isRunning: boolean): void {
        if (!isRunning) {
            this.progressStatus = {
                status: 'waiting',
                text: 'Esperando',
                color: '#6c757d'
            };
        } else if (this.percentage >= 100) {
            this.progressStatus = {
                status: 'completed',
                text: 'Completado',
                color: '#28a745'
            };
        } else {
            this.progressStatus = {
                status: 'running',
                text: 'Ejecutando',
                color: '#007bff'
            };
        }
        this.cd.detectChanges();
    }
}
