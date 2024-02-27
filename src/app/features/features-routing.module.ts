import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrandsComponent } from './brands/brands.component';
import { PageUrlName } from '../models/business/enums/page-name.model';
import { MetersComponent } from './meters/meters.component';
import { AvailableTestComponent } from './available-test/available-test.component';
import { PendingChangesGuard } from '../guards/peding-changes.guard';
import { EssayTemplateBuilderComponent } from './essay-template-builder/essay-template-builder.component';
import { RunEssayComponent } from './run-essay/run-essay.component';

const routes: Routes = [
  {
    path: PageUrlName.brands,
    component: BrandsComponent,
  },
  {
    path: PageUrlName.meters,
    component: MetersComponent,
  },
  {
    path: PageUrlName.availableTest,
    component: AvailableTestComponent,
  },
  {
    path: PageUrlName.newEssayTemplate,
    component: EssayTemplateBuilderComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: PageUrlName.editEssayTemplate,
    component: EssayTemplateBuilderComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: PageUrlName.runEssay,
    component: RunEssayComponent,
    // canDeactivate: [DevicesTurnOffGuard] // TODO
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
