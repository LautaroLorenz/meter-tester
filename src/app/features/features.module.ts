import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './detail/detail.component';
import { FeaturesRoutingModule } from './features-routing.module';
import { BrandsComponent } from './brands/brands.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    DetailComponent,
    HomeComponent,
    BrandsComponent,
    PageNotFoundComponent,
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
