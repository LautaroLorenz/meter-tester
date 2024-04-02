import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { PatternStatus } from '../../../models/business/interafces/pattern-status.model';
import { Observable, ReplaySubject, map, tap } from 'rxjs';
import { SoftwarePatternCommands } from '../../../models/business/enums/commands.model';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatternComponent extends MachineDeviceComponent {
  override readonly device = Devices.PAT;

  readonly lastStatus$ = new ReplaySubject<PatternStatus>(1);

  loopStatus$(): Observable<PatternStatus> {
    return this.loopWrite$(
      this.buildCommand(SoftwarePatternCommands.STATUS),
      this.loopDelay,
      () => this.deviceStatus$.value === DeviceStatus.Working
    ).pipe(
      map((response) => this.mapStatusCommand(response)),
      tap((patternStatus) => this.lastStatus$.next(patternStatus))
    );
  }

  private mapStatusCommand(command: string): PatternStatus {
    const blocks = CommandDirector.getBlocks(command);
    const numberBlocks = blocks
      .slice(3, 13)
      .map((block) => Number(block.replace(/x/g, '')));
    return {
      constant: Number(numberBlocks[0]),
      phaseL1: {
        voltage: Number(numberBlocks[1]),
        current: Number(numberBlocks[4]),
        anglePhi: Number(numberBlocks[7]),
      },
      phaseL2: {
        voltage: Number(numberBlocks[2]),
        current: Number(numberBlocks[5]),
        anglePhi: Number(numberBlocks[8]),
      },
      phaseL3: {
        voltage: Number(numberBlocks[3]),
        current: Number(numberBlocks[6]),
        anglePhi: Number(numberBlocks[9]),
      },
    };
  }
}
