import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MachineCalculatorComponent } from './machine-calculator/machine-calculator.component';

const routes: Routes = [
    {
        path: 'machine-calculator',
        component: MachineCalculatorComponent
    }
];

@NgModule({
    declarations: [MachineCalculatorComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
    providers: []
})
export class SecondaryWindowModule {}
