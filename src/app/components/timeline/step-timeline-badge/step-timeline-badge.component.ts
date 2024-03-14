import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepStatus } from '../../../models/business/enums/step-status.model';

@Component({
  selector: 'app-step-timeline-badge',
  templateUrl: './step-timeline-badge.component.html',
  styleUrls: ['./step-timeline-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepTimelineBadgeComponent {
  @Input() size!: 'small' | 'medium' | 'large';
  @Input() status!: StepStatus;
  @Input() index!: string | number | undefined;

  readonly StepStatus = StepStatus;

  get sizeConfig(): {
    fontSize: string;
    size: string;
  } {
    if (this.size === 'large') {
      return {
        fontSize: '1.125rem',
        size: '2.25rem',
      };
    }
    if (this.size === 'medium') {
      return {
        fontSize: '0.9rem',
        size: '1.8rem',
      };
    }

    return {
      fontSize: '0.6rem',
      size: '1.2rem',
    };
  }

  get isDone(): boolean {
    return this.status === StepStatus.Done;
  }

  get isCurrent(): boolean {
    return this.status === StepStatus.Current;
  }

  get isPending(): boolean {
    return this.status === StepStatus.Pending;
  }
}
