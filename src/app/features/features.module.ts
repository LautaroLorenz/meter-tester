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

@NgModule({
  declarations: [
    PageNotFoundComponent,
    BrandsComponent,
    MetersComponent,
    AvailableTestComponent,
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
