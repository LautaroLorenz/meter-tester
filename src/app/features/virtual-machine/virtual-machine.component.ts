import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.scss'],
})
export class VirtualMachineComponent implements OnInit, OnDestroy {
  @ViewChild('commandHistory', { static: true })
  commandHistory!: CommandHistoryComponent;
  @ViewChild('commandMap', { static: true })
  commandMap!: CommandMapComponent;

  configForm: FormGroup;

  readonly VMResponseTypesConstant = VMResponseTypesConstant;
  readonly VMDelayTypesConstant = VMDelayTypesConstant;
  readonly VMCommandRefreshTypeConstant = VMCommandRefreshTypeConstant;
  readonly VMDelayTypes = VMDelayTypes;

  private onDestroy = new Subject<void>();

  constructor(
    private readonly virtualMachineService: VirtualMachineService,
    private readonly fb: FormBuilder
  ) {
    this.configForm = this.buildConfigForm();
  }

  ngOnInit(): void {
    this.observeSoftware();
  }

  virtualMachineWrite(command: string): void {
    // TODO revisar la configuración antes de enviar.
    this.commandHistory.add(command);
    void this.virtualMachineService.write(command + '\n');
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private observeSoftware(): void {
    this.virtualMachineService.handleSoftwareToMachine$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((command) => {
        // TODO revisar la configuración al recibir.
        console.log(this.commandMap.get(command));
        this.commandHistory.add(command);
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
}
