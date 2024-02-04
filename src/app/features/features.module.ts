import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { FeaturesRoutingModule } from './features-routing.module';
import { BrandsComponent } from './brands/brands.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { MetersComponent } from './meters/meters.component';

@NgModule({
  declarations: [
    HomeComponent,
    PageNotFoundComponent,
    BrandsComponent,
    MetersComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    TranslateModule.forChild(),
    ComponentsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
})
export class FeaturesModule {}
