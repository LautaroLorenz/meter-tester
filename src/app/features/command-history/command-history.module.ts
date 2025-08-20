import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { CommandHistoryComponent } from './command-history.component';
import { VirtualMachineModule } from '../../components/virtual-machine/virtual-machine.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: CommandHistoryComponent
    }
];

@NgModule({
    declarations: [CommandHistoryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        VirtualMachineModule,
        PanelModule,
        PipesModule,
        DirectivesModule
    ],
})
export class CommandHistoryModule {}
