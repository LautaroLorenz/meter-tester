import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetersComponent } from './meters.component';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';

const Routes = [
    {
        path: '',
        component: MetersComponent
    }
];

@NgModule({
    declarations: [MetersComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ]
})
export class MetersModule {}
