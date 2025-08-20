import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageUrlName } from '../models/business/enums/page-name.model';

const routes: Routes = [
    {
        path: PageUrlName.brands,
        loadChildren: () => import('./brands/brands.module').then((m) => m.BrandsModule)
    },
    {
        path: PageUrlName.meters,
        loadChildren: () => import('./meters/meters.module').then((m) => m.MetersModule)
    },
    {
        path: PageUrlName.availableTest,
        loadChildren: () => import('./available-test/available-test.module').then((m) => m.AvailableTestModule)
    },
    {
        path: PageUrlName.newEssayTemplate,
        loadChildren: () =>
            import('./essay-template-builder/essay-template-builder.module').then((m) => m.EssayTemplateBuilderModule)
    },
    {
        path: PageUrlName.editEssayTemplate,
        loadChildren: () =>
            import('./essay-template-builder/essay-template-builder.module').then((m) => m.EssayTemplateBuilderModule)
    },
    {
        path: PageUrlName.runEssay,
        loadChildren: () => import('./run-essay/run-essay.module').then((m) => m.RunEssayModule)
    },
    {
        path: PageUrlName.virtualMachine,
        loadChildren: () => import('./virtual-machine/virtual-machine.module').then((m) => m.VirtualMachineModule)
    },
    {
        path: PageUrlName.history,
        loadChildren: () =>
            import('./history-essay-step-stand/history-essay-step-stand.module').then(
                (m) => m.HistoryEssayStepStandModule
            )
    },
    {
        path: PageUrlName.historyEssay,
        loadChildren: () => import('./history-essay/history-essay.module').then((m) => m.HistoryEssayModule)
    },
    {
        path: PageUrlName.dashboard,
        loadChildren: () => import('./statics/statics.module').then((m) => m.StaticsModule)
    },
    {
        path: PageUrlName.commandHistory,
        loadChildren: () => import('./command-history/command-history.module').then((m) => m.CommandHistoryModule)
    },
    {
        path: PageUrlName.backupCreate,
        loadChildren: () => import('./backups/create-backup/create-backup.module').then((m) => m.CreateBackupModule)
    },
    {
        path: PageUrlName.backupRestore,
        loadChildren: () => import('./backups/restore-backup/restore-backup.module').then((m) => m.RestoreBackupModule)
    },
    {
        path: 'secondary-window',
        loadChildren: () => import('./secondary-window/secondary-window.module').then((m) => m.SecondaryWindowModule)
    }
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeaturesRoutingModule {}
