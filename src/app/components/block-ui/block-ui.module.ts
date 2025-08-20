import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockUiComponent } from './block-ui.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule as PrimeNgBlockUiModule } from 'primeng/blockui';

@NgModule({
    declarations: [BlockUiComponent],
    imports: [CommonModule, PrimeNgBlockUiModule, ProgressSpinnerModule],
    exports: [BlockUiComponent]
})
export class BlockUiModule {}
