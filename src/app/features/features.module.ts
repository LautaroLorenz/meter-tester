import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { BrandsComponent } from './brands/brands.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { MetersComponent } from './meters/meters.component';
import { AvailableTestComponent } from './available-test/available-test.component';
import { EssayTemplateBuilderComponent } from './essay-template-builder/essay-template-builder.component';
import { PendingChangesGuard } from '../guards/peding-changes.guard';
import { DirectivesModule } from '../directives/directives.model';
import { StepsSequenceTableComponent } from './essay-template-builder/components/steps-sequence-table/steps-sequence-table.component';
import { AddStepToSequenceComponent } from './essay-template-builder/components/add-step-to-sequence/add-step-to-sequence.component';
import { EditStepInSequenceComponent } from './essay-template-builder/components/edit-step-in-sequence/edit-step-in-sequence.component';
import { EssayTemplateStepFormComponent } from './essay-template-builder/components/essay-template-step-form/essay-template-step-form.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    BrandsComponent,
    MetersComponent,
    AvailableTestComponent,
    EssayTemplateBuilderComponent,
    StepsSequenceTableComponent,
    AddStepToSequenceComponent,
    EditStepInSequenceComponent,
    EssayTemplateStepFormComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    TranslateModule.forChild(),
    ComponentsModule,
    ReactiveFormsModule,
    PipesModule,
    DirectivesModule,
  ],
  providers: [PendingChangesGuard],
})
export class FeaturesModule {}
