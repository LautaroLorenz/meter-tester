import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
    declarations: [PageNotFoundComponent],
    imports: [CommonModule, FeaturesRoutingModule],
    providers: []
})
export class FeaturesModule {}
