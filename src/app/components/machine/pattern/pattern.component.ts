import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { PatternStatus } from '../../../models/business/interafces/pattern-status.model';
import { Observable, ReplaySubject, map, tap } from 'rxjs';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatternComponent extends MachineDeviceComponent {
  override readonly device = Devices.PAT;

  readonly lastStatus$ = new ReplaySubject<PatternStatus>(1);

  constant$(stepMeterConstant: MeterConstantEnum): Observable<PatternStatus> {
    const stepMeterConstantBlock = this.getStepConstantBlock(stepMeterConstant);
    return this.write$(this.buildCommand(stepMeterConstantBlock)).pipe(
      map((response) => this.mapStatusCommand(response)),
      tap((patternStatus) => this.lastStatus$.next(patternStatus))
    );
  }

  private mapStatusCommand(command: string): PatternStatus {
    const blocks = CommandDirector.getBlocks(command);
    const constant = Number(blocks[3]);
    return { constant };
  }

  private getStepConstantBlock(stepMeterConstant: MeterConstantEnum): string {
    switch (stepMeterConstant) {
      case MeterConstantEnum.Active:
        return 'A';
      case MeterConstantEnum.Reactive:
        return 'R';
    }
  }
}
