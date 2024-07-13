import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrandsComponent } from './brands/brands.component';
import { PageUrlName } from '../models/business/enums/page-name.model';
import { MetersComponent } from './meters/meters.component';
import { AvailableTestComponent } from './available-test/available-test.component';
import { PendingChangesGuard } from '../guards/peding-changes.guard';
import { EssayTemplateBuilderComponent } from './essay-template-builder/essay-template-builder.component';
import { RunEssayComponent } from './run-essay/run-essay.component';
import { VirtualMachineComponent } from './virtual-machine/virtual-machine.component';
import { HistoryEssayStepStandComponent } from './history-essay-step-stand/history-essay-step-stand.component';
import { StaticsComponent } from './statics/statics.component';
import { HistoryEssayComponent } from './history-essay/history-essay.component';
import { RunEssayGuard } from '../guards/run-essay.guard';
import { CommandHistoryComponent } from './command-history/command-history.component';
import { CreateBackupComponent } from './backups/create-backup/create-backup.component';
import { RestoreBackupComponent } from './backups/restore-backup/restore-backup.component';

const routes: Routes = [
    {
        path: PageUrlName.brands,
        component: BrandsComponent
    },
    {
        path: PageUrlName.meters,
        component: MetersComponent
    },
    {
        path: PageUrlName.availableTest,
        component: AvailableTestComponent
    },
    {
        path: PageUrlName.newEssayTemplate,
        component: EssayTemplateBuilderComponent,
        canDeactivate: [PendingChangesGuard]
    },
    {
        path: PageUrlName.editEssayTemplate,
        component: EssayTemplateBuilderComponent,
        canDeactivate: [PendingChangesGuard]
    },
    {
        path: PageUrlName.runEssay,
        component: RunEssayComponent,
        canDeactivate: [RunEssayGuard]
    },
    {
        path: PageUrlName.virtualMachine,
        component: VirtualMachineComponent
    },
    {
        path: PageUrlName.history,
        component: HistoryEssayStepStandComponent
    },
    {
        path: PageUrlName.historyEssay,
        component: HistoryEssayComponent
    },
    {
        path: PageUrlName.dashboard,
        component: StaticsComponent
    },
    {
        path: PageUrlName.commandHistory,
        component: CommandHistoryComponent
    },
    {
        path: PageUrlName.backupCreate,
        component: CreateBackupComponent
    },
    {
        path: PageUrlName.backupRestore,
        component: RestoreBackupComponent
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeaturesRoutingModule {}
