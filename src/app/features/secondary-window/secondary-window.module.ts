import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PatternStatusWindowModule } from './pages/pattern-status-window/pattern-status-window.module';
import { AlwaysOnTopToggleModule } from './components/always-on-top-toggle/always-on-top-toggle.module';

const routes: Routes = [
    {
        path: 'pattern-status-window',
        loadChildren: () =>
            import('./pages/pattern-status-window/pattern-status-window.module').then(
                (m) => m.PatternStatusWindowModule
            )
    }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), PatternStatusWindowModule, AlwaysOnTopToggleModule],
    providers: []
})
export class SecondaryWindowModule {}
