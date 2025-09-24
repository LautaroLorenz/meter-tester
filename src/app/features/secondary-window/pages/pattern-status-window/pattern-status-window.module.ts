import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternStatusWindowComponent } from './pattern-status-window.component';
import { RouterModule, Routes } from '@angular/router';
import { PatternStatusModule } from '../../../../components/machine/pattern/components/pattern-status/pattern-status.module';
import { AlwaysOnTopToggleModule } from '../../components/always-on-top-toggle/always-on-top-toggle.module';

const routes: Routes = [
    {
        path: '',
        component: PatternStatusWindowComponent
    }
];

@NgModule({
    declarations: [PatternStatusWindowComponent],
    imports: [CommonModule, RouterModule.forChild(routes), PatternStatusModule, AlwaysOnTopToggleModule]
})
export class PatternStatusWindowModule {}
