import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrandsComponent } from './brands/brands.component';
import { PageUrlName } from '../components/menu/models/page-name.model';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: PageUrlName.brands,
    component: BrandsComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
