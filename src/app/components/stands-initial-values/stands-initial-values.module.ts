import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

// App imports
import { TableColumnModule } from '../table-column/table-column.module';

import { StandsInitialValuesComponent } from './stands-initial-values.component';

@NgModule({
    declarations: [StandsInitialValuesComponent],
    imports: [CommonModule, FormsModule, TableModule, InputTextModule, TableColumnModule],
    exports: [StandsInitialValuesComponent]
})
export class StandsInitialValuesModule {}
