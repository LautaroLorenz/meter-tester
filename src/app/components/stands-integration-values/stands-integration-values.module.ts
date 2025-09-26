import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

// App imports
import { TableColumnModule } from '../table-column/table-column.module';
import { ResultStatusModule } from '../result-status/result-status.module';

import { StandsIntegrationValuesComponent } from './stands-integration-values.component';

@NgModule({
    declarations: [StandsIntegrationValuesComponent],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputNumberModule,
        ButtonModule,
        TooltipModule,
        TableColumnModule,
        ResultStatusModule
    ],
    exports: [StandsIntegrationValuesComponent]
})
export class StandsIntegrationValuesModule {}
