import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';

// App imports
import { TableColumnModule } from '../table-column/table-column.module';

import { StandsIntegrationValuesComponent } from './stands-integration-values.component';

@NgModule({
    declarations: [StandsIntegrationValuesComponent],
    imports: [CommonModule, FormsModule, TableModule, InputNumberModule, TableColumnModule],
    exports: [StandsIntegrationValuesComponent]
})
export class StandsIntegrationValuesModule {}
