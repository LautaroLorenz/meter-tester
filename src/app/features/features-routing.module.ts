import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrandsComponent } from './brands/brands.component';
import { PageUrlName } from '../components/menu/models/page-name.model';
import { MetersComponent } from './meters/meters.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: PageUrlName.brands,
    component: BrandsComponent,
  },
  {
    path: PageUrlName.meters,
    component: MetersComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
