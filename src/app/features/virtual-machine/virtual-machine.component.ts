import { Component, OnDestroy, OnInit } from '@angular/core';
import { VirtualMachineService } from '../../services/virtual-machine.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.scss'],
})
export class VirtualMachineComponent implements OnInit, OnDestroy {
  private onDestroy = new Subject<void>();

  constructor(private readonly virtualMachineService: VirtualMachineService) {}

  ngOnInit(): void {
    this.observeSoftware();
  }

  virtualMachineWrite(command: string): void {
    void this.virtualMachineService.write(command + '\n');
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private observeSoftware(): void {
    this.virtualMachineService.handleSoftwareToMachine$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((response) => {
        console.log('handle software write', response);
      });
  }
}
