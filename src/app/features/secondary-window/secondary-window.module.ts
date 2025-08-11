import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BootTestParamsWindowComponent } from './boot-test-params-window/boot-test-params-window.component';

const routes: Routes = [
    {
        path: 'boot-test-params',
        component: BootTestParamsWindowComponent
    }
];

@NgModule({
    declarations: [BootTestParamsWindowComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
    providers: []
})
export class SecondaryWindowModule {}
