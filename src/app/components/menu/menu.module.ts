import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { SystemInfoDialogComponent } from './components/system-info-dialog/system-info-dialog.component';
import { DatabaseSettingsDialogComponent } from './components/database-settings-dialog/database-settings-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule as PrimeNgMenuModule } from 'primeng/menu';

@NgModule({
    declarations: [MenuComponent, SystemInfoDialogComponent, DatabaseSettingsDialogComponent],
    imports: [CommonModule, DialogModule, ButtonModule, MenubarModule, PrimeNgMenuModule],
    exports: [MenuComponent]
})
export class MenuModule {}
