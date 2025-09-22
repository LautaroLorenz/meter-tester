import { SecondaryWindowService } from './../../services/secondary-window.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VirtualMachineService } from '../../services/virtual-machine.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { CommandMapComponent } from '../../components/virtual-machine/command-map/command-map.component';
import { take } from 'rxjs/operators';
import { CommandHistoryService } from '../../services/command-history.service';

@Component({
    templateUrl: './virtual-machine.component.html',
    styleUrls: ['./virtual-machine.component.scss']
})
export class VirtualMachineComponent implements OnInit, OnDestroy {
    @ViewChild('commandMap', { static: true })
    commandMap!: CommandMapComponent;

    private isWindowReady = false;
    private onDestroy = new Subject<void>();

    constructor(
        private readonly virtualMachineService: VirtualMachineService,
        private readonly fb: FormBuilder,
        public readonly commandHistoryService: CommandHistoryService,
        private secondaryWindowService: SecondaryWindowService
    ) {}

    ngOnInit(): void {
        this.observeSoftware();
        this.setWindowAsReady();
    }

    virtualMachineWrite(command: string): void {
        this.virtualMachineService
            .write$(command + '\n')
            .pipe(take(1))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    private observeSoftware(): void {
        this.virtualMachineService.handleSoftwareToMachine$.pipe(takeUntil(this.onDestroy)).subscribe((command) => {
            const response = this.processCommand(command);
            this.virtualMachineWrite(response);
        });
    }

    private processCommand(command: string): string {
        const commandMap = this.commandMap.get(command);
        return commandMap?.lastResponse || '';
    }

    private setWindowAsReady(): void {
        if (this.isWindowReady) {
            return;
        }
        setTimeout(() => {
            // Avisamos al proceso principal que el simulador esta inicializado
            this.secondaryWindowService
                .setSecondaryWindowReady()
                .then(() => (this.isWindowReady = true))
                .catch(() => {});
        }, 100);
    }
}
