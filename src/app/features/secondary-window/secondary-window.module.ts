import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
// import { StandResultsComponent } from './stand-results/stand-results.component';

const routes: Routes = [
    // {
    //     path: 'stand-results',
    //     component: StandResultsComponent
    // }
];

@NgModule({
    declarations: [
        // StandResultsComponent
    ],
    imports: [CommonModule, RouterModule.forChild(routes), ComponentsModule],
    providers: []
})
export class SecondaryWindowModule {}
