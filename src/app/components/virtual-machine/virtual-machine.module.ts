import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandHistoryComponent } from './command-history/command-history.component';
import { CommandMapComponent } from './command-map/command-map.component';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TableColumnModule } from '../table-column/table-column.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CommandMapComponent, CommandHistoryComponent],
    imports: [CommonModule, PanelModule, TableModule, ButtonModule, TableColumnModule, DropdownModule, FormsModule],
    exports: [CommandMapComponent, CommandHistoryComponent]
})
export class VirtualMachineModule {}
