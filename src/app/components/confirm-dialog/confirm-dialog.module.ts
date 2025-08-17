import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogModule as PrimeNgConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
    declarations: [ConfirmDialogComponent],
    imports: [CommonModule, PrimeNgConfirmDialogModule],
    exports: [ConfirmDialogComponent]
})
export class ConfirmDialogModule {}
