import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-pulses-progress-bar',
    templateUrl: './pulses-progress-bar.component.html',
    styleUrls: ['./pulses-progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PulsesProgressBarComponent implements OnChanges {
    @Input() visibility: 'visible' | 'hidden' = 'visible';
    @Input() pulsesCounted!: number;
    @Input() targetPulses!: number;
    @Input() isRunning = false;

    // Progress tracking
    percentage = 0;
    statusText = 'Esperando';

    get color(): string {
        // If completed (100% or more), always show green regardless of running state
        if (this.percentage >= 100 || this.pulsesCounted >= this.targetPulses) {
            return 'var(--green-400)';
        } else if (!this.isRunning) {
            return 'var(--surface-ground)';
        } else {
            return 'var(--primary-color)';
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pulsesCounted'] || changes['targetPulses'] || changes['isRunning']) {
            this.updateProgress();
        }
    }

    private updateProgress(): void {
        // Calculate percentage based on inputs
        this.percentage = this.targetPulses > 0 ? Math.min((this.pulsesCounted / this.targetPulses) * 100, 100) : 0;

        // Priority: Completed state first, then running state
        if (this.percentage >= 100 || this.pulsesCounted >= this.targetPulses) {
            this.statusText = 'Completado';
        } else if (!this.isRunning) {
            this.statusText = 'Esperando';
        } else {
            this.statusText = 'Ejecutando';
        }
    }
}
