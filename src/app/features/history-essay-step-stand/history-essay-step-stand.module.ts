import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryEssayStepStandComponent } from './history-essay-step-stand.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: HistoryEssayStepStandComponent
    }
];

@NgModule({
    declarations: [HistoryEssayStepStandComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ]
})
export class HistoryEssayStepStandModule {}
