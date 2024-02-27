import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeaturesRoutingModule } from './features/features-routing.module';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { PageUrlName } from './models/business/enums/page-name.model';

const routes: Routes = [
  {
    path: '',
    redirectTo: PageUrlName.availableTest,
    pathMatch: 'full',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {}), FeaturesRoutingModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
