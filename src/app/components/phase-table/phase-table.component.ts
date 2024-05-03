import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Phase } from '../../models/business/interafces/phase.model';

@Component({
  selector: 'app-phase-table',
  templateUrl: './phase-table.component.html',
  styleUrls: ['./phase-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhaseTableComponent {
  @Input() showTexts!: boolean;
  @Input() phaseL1: Phase | undefined;
  @Input() phaseL2: Phase | undefined;
  @Input() phaseL3: Phase | undefined;
}
