import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { VirtualMachineService } from '../../services/virtual-machine.service';
import { Subject, takeUntil } from 'rxjs';
import { CommandHistoryComponent } from '../../components/virtual-machine/command-history/command-history.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  VMCommandRefreshTypeConstant,
  VMDelayTypesConstant,
  VMResponseTypesConstant,
} from '../../models/business/constants/virtual-machine-contant.model';
import {
  CommandRefreshType,
  VMDelayTypes,
  VMResponseTypes,
} from '../../models/business/enums/virtual-machine-config.model';
import { CommandMapComponent } from '../../components/virtual-machine/command-map/command-map.component';
import { VMDeviceComponent } from '../../models/business/class/virtual-machine-device.model';
import { Random } from '../../models/core/random.model';

@Component({
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.scss'],
})
export class VirtualMachineComponent implements OnInit, OnDestroy {
  @ViewChild('commandHistory', { static: true })
  commandHistory!: CommandHistoryComponent;
  @ViewChild('commandMap', { static: true })
  commandMap!: CommandMapComponent;
  @ViewChildren(VMDeviceComponent)
  vmDevices!: QueryList<VMDeviceComponent>;

  configForm: FormGroup;

  readonly VMResponseTypesConstant = VMResponseTypesConstant;
  readonly VMDelayTypesConstant = VMDelayTypesConstant;
  readonly VMCommandRefreshTypeConstant = VMCommandRefreshTypeConstant;
  readonly VMDelayTypes = VMDelayTypes;
  readonly VMResponseTypes = VMResponseTypes;

  private onDestroy = new Subject<void>();

  constructor(
    private readonly virtualMachineService: VirtualMachineService,
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone
  ) {
    this.configForm = this.buildConfigForm();
  }

  ngOnInit(): void {
    this.observeSoftware();
  }

  virtualMachineWrite(command: string): void {
    const delay = this.getSendDelayByConfig();
    setTimeout(() => {
      this.ngZone.run(() => {
        this.commandHistory.add(command);
        void this.virtualMachineService.write(command + '\n');
        if (
          this.configForm.getRawValue().commandRefreshType ===
          CommandRefreshType.Automatic
        ) {
          this.refreshCommands();
        }
      });
    }, delay);
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private observeSoftware(): void {
    this.virtualMachineService.handleSoftwareToMachine$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((command) => {
        this.commandHistory.add(command);
        if (
          this.configForm.getRawValue().responseType ===
          VMResponseTypes.Automatic
        ) {
          this.sendAutomaticResponse(command);
        }
      });
  }

  private buildConfigForm(): FormGroup {
    return this.fb.group({
      responseType: [VMResponseTypes.Automatic],
      delayType: [VMDelayTypes.Range],
      fixedDelay: [250],
      minDelay: [50],
      maxDelay: [500],
      commandRefreshType: [CommandRefreshType.Automatic],
    });
  }

  private sendAutomaticResponse(command: string): void {
    const map = this.commandMap.get(command);
    if (!map) {
      return;
    }
    const device = this.vmDevices.find(({ device }) => device === map.device);
    if (!device) {
      return;
    }
    const responseCommand = device.getCommandByName(map.responseCommandName);
    if (!responseCommand) {
      return;
    }
    this.virtualMachineWrite(responseCommand);
  }

  private getSendDelayByConfig(): number {
    const { responseType, delayType, fixedDelay, minDelay, maxDelay } =
      this.configForm.getRawValue();

    if (responseType === VMResponseTypes.Manual) {
      return 0;
    }

    switch (delayType as VMDelayTypes) {
      case VMDelayTypes.Off:
        return 0;
      case VMDelayTypes.Fixed:
        return fixedDelay as number;
      case VMDelayTypes.Range:
        return Random.range(minDelay as number, maxDelay as number);
    }
  }

  private refreshCommands(): void {
    this.vmDevices.forEach((vmDevice) =>
      vmDevice.commandLines.forEach((commandLine) =>
        commandLine.refreshCommand()
      )
    );
  }
}
