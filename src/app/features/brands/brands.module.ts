import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { BrandsComponent } from './brands.component';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: BrandsComponent
    }
];

@NgModule({
    declarations: [BrandsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ],
    providers: []
})
export class BrandsModule {}
