import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EssayTemplateBuilderComponent } from './essay-template-builder.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { PendingChangesGuard } from '../../guards/peding-changes.guard';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: EssayTemplateBuilderComponent,
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [EssayTemplateBuilderComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ]
})
export class EssayTemplateBuilderModule {}
