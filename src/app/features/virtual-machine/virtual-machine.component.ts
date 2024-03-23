import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VirtualMachineService } from '../../services/virtual-machine.service';
import { Subject, takeUntil } from 'rxjs';
import { CommandHistoryComponent } from '../../components/virtual-machine/command-history/command-history.component';

@Component({
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.scss'],
})
export class VirtualMachineComponent implements OnInit, OnDestroy {
  @ViewChild('commandHistory', { static: true })
  commandHistory!: CommandHistoryComponent;

  private onDestroy = new Subject<void>();

  constructor(private readonly virtualMachineService: VirtualMachineService) {}

  ngOnInit(): void {
    this.observeSoftware();
  }

  virtualMachineWrite(command: string): void {
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
        this.commandHistory.add(command);
      });
  }
}
