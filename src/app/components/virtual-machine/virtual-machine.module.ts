import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandHistoryComponent } from './command-history/command-history.component';
import { CommandMapComponent } from './command-map/command-map.component';
import { SimulatorPanelComponent } from './simulator-panel/simulator-panel.component';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TableColumnModule } from '../table-column/table-column.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
    declarations: [CommandMapComponent, CommandHistoryComponent, SimulatorPanelComponent],
    imports: [
        CommonModule,
        PanelModule,
        TableModule,
        ButtonModule,
        TableColumnModule,
        DropdownModule,
        FormsModule,
        InputNumberModule,
        TooltipModule
    ],
    exports: [CommandMapComponent, CommandHistoryComponent, SimulatorPanelComponent]
})
export class VirtualMachineModule {}
