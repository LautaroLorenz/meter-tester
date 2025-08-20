import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualMachineComponent } from './virtual-machine.component';
import { RouterModule } from '@angular/router';
import { VirtualMachineModule as VirtualMachineComponentsModule } from '../../components/virtual-machine/virtual-machine.module';
import { PrimeNgModule } from '../../components/primeng/primeng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: VirtualMachineComponent
    }
];

@NgModule({
    declarations: [VirtualMachineComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        VirtualMachineComponentsModule,
        ReactiveFormsModule,
        PrimeNgModule,
        PipesModule,
        DirectivesModule
    ]
})
export class VirtualMachineModule {}
