import { Component } from '@angular/core';
import { SecondaryWindowComponent } from '../secondary-window.model';

@Component({
  templateUrl: './machine-calculator.component.html',
  styleUrls: ['./machine-calculator.component.scss']
})
export class MachineCalculatorComponent extends SecondaryWindowComponent {
    windowTitle = 'Calculador';

    onMainWindowMessage(args: any): void {
        console.log(`from-main-window-${this.windowId || ''}`, args);
    }
}
