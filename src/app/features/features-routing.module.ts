import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrandsComponent } from './brands/brands.component';
import { PageUrlName } from '../components/menu/models/page-name.model';
import { MetersComponent } from './meters/meters.component';
import { AvailableTestComponent } from './available-test/available-test.component';

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
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
