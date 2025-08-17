import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { RunEssayComponent } from './run-essay.component';
import { RunEssayGuard } from '../../guards/run-essay.guard';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: RunEssayComponent,
        canDeactivate: [RunEssayGuard]
    }
];

@NgModule({
    declarations: [RunEssayComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ]
})
export class RunEssayModule {}
