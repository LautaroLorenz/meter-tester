import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestoreBackupComponent } from './restore-backup.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../../components/components.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { DirectivesModule } from '../../../directives/directives.module';

const Routes = [
    {
        path: '',
        component: RestoreBackupComponent
    }
];

@NgModule({
    declarations: [RestoreBackupComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(Routes),
        ReactiveFormsModule,
        ComponentsModule,
        PipesModule,
        DirectivesModule
    ]
})
export class RestoreBackupModule {}
