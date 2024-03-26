import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { Observable, map, take, tap } from 'rxjs';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { Stand } from '../../../models/business/interafces/stand.model';
import { DatabaseService } from '../../../services/database.service';
import {
  Meter,
  MeterDbTableContext,
} from '../../../models/business/database/meter.model';
import { RelationsManager } from '../../../models/core/relations-manager.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';
import { MeterConstantDirector } from '../../../models/business/class/meter-constant.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent
  extends MachineDeviceComponent
  implements OnInit
{
  override readonly device = Devices.CAL;

  private meters!: Meter[];
  private readonly dbServiceMeters = inject(DatabaseService<Meter>);

  ngOnInit(): void {
    this.dbServiceMeters
      .getTableReply$(MeterDbTableContext.tableName)
      .pipe(
        take(1),
        map((response) => {
          const { foreignTables } = MeterDbTableContext;
          return RelationsManager.mergeRelationsIntoRows<Meter>(
            response.rows,
            response.relations,
            foreignTables
          );
        }),
        tap((meters) => (this.meters = meters))
      )
      .subscribe();
    this.dbServiceMeters.getTable(MeterDbTableContext.tableName, {
      relations: MeterDbTableContext.foreignTables,
    });
  }

  stop$(): Observable<string> {
    const from = Devices.STW;
    const to = this.device;
    const command = CommandDirector.build(
      from,
      to,
      SoftwareCalculatorCommands.STOP
    );
    return this.write$(command).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.Connected))
    );
  }

  start$(
    commandType: SoftwareCalculatorCommands,
    preparationStepStands: Stand[],
    stepMeterConstant: MeterConstantEnum
  ): Observable<string> {
    const from = Devices.STW;
    const to = this.device;

    const stands: string[] = preparationStepStands.map(
      (stand, index) =>
        `PS${this.standIndex(index)}${this.standConstant(
          stand,
          stepMeterConstant
        )}`
    );
    const command = CommandDirector.build(from, to, commandType, ...stands);

    return this.write$(command).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.Working))
    );
  }

  private standIndex(index: number) {
    return (index + 1).toString().padStart(2, '0');
  }

  private standConstant(
    stand: Stand,
    stepMeterConstant: MeterConstantEnum
  ): string {
    const offStandConstant = 'xxxxx';
    if (!stand.isActive) {
      return offStandConstant;
    }
    const meter = this.meters.find((meter) => meter.id === stand.meterId);
    if (!meter) {
      return offStandConstant;
    }
    const meterConstant = MeterConstantDirector.get(meter, stepMeterConstant);
    if (!meterConstant) {
      return offStandConstant;
    }
    return meterConstant.toString().padStart(offStandConstant.length, '0');
  }
}
