import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VmCalculatorComponent } from './devices/vm-calculator/vm-calculator.component';
import { VmPatternComponent } from './devices/vm-pattern/vm-pattern.component';
import { VmGeneratorComponent } from './devices/vm-generator/vm-generator.component';
import { CommandHistoryComponent } from './command-history/command-history.component';
import { CommandLineComponent } from './command-line/command-line.component';
import { CommandMapComponent } from './command-map/command-map.component';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TableColumnModule } from '../table-column/table-column.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        VmCalculatorComponent,
        VmPatternComponent,
        VmGeneratorComponent,
        CommandLineComponent,
        CommandMapComponent,
        CommandHistoryComponent
    ],
    imports: [CommonModule, PanelModule, TableModule, ButtonModule, TableColumnModule, DropdownModule, FormsModule],
    exports: [
        VmCalculatorComponent,
        VmPatternComponent,
        VmGeneratorComponent,
        CommandLineComponent,
        CommandMapComponent,
        CommandHistoryComponent
    ]
})
export class VirtualMachineModule {}
