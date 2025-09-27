import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlwaysOnTopToggleComponent } from './always-on-top-toggle.component';
import { PrimeNgModule } from '../../../../components/primeng/primeng.module';

@NgModule({
    declarations: [AlwaysOnTopToggleComponent],
    imports: [CommonModule, FormsModule, PrimeNgModule],
    exports: [AlwaysOnTopToggleComponent]
})
export class AlwaysOnTopToggleModule {}
