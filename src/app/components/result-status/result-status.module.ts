import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { PrimeNgModule } from '../primeng/primeng.module';

import { ResultStatusComponent } from './result-status.component';

@NgModule({
    declarations: [ResultStatusComponent],
    imports: [CommonModule, PrimeNgModule],
    exports: [ResultStatusComponent]
})
export class ResultStatusModule {}
