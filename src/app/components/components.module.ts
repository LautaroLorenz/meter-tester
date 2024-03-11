import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from './primeng/primeng.module';
import { PageTitleComponent } from './page-title/page-title.component';
import { AbmComponent } from './abm/abm.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MenuComponent } from './menu/menu.component';
import { TabMenuTestComponent } from './tab-menu-test/tab-menu-test.component';
import { ValidatorMessagesComponent } from './validator-messages/validator-messages.component';
import { BootTestBuildFormComponent } from './steps/boot-test/boot-test-build-form/boot-test-build-form.component';
import { PhaseFormGroupComponent } from './phase-form-group/phase-form-group.component';
import { PreparationBuildFormComponent } from './steps/preparation/preparation-build-form/preparation-build-form.component';
import { ContrastTestBuildFormComponent } from './steps/contrast-test/contrast-test-build-form/contrast-test-build-form.component';
import { VacuumTestBuildFormComponent } from './steps/vacuum-test/vacuum-test-build-form/vacuum-test-build-form.component';
import { InputErrorComponent } from './input-error/input-error.component';
import { AddStepToSequenceComponent } from './steps/add-step-to-sequence/add-step-to-sequence.component';
import { StepsSequenceTableComponent } from './steps/steps-sequence-table/steps-sequence-table.component';
import { EditStepInSequenceComponent } from './steps/edit-step-in-sequence/edit-step-in-sequence.component';

// TODO revisar que no quede ninguno sin agregar
// import { DirectivesModule } from '../directives/directives.module';
// import { FillAvailableSpaceComponent } from './fill-available-space/fill-available-space.component';
// import { StepSelectorComponent } from './step-selector/step-selector.component';
// import { FormArrayControlsOrderListComponent } from './form-array-controls-order-list/form-array-controls-order-list.component';
// import { StandIdentificationActionComponent } from './actions/stand-identification-action/stand-identification-action.component';
// import { ActionSwitchListComponent } from './action-switch-list/action-switch-list.component';
// import { PhotocellAdjustmentValuesActionComponent } from './actions/photocell-adjustment-values-action/photocell-adjustment-values-action.component';
// import { EnterTestValuesActionComponent } from './actions/enter-test-values-action/enter-test-values-action.component';
// import { ContrastTestParametersActionComponent } from './actions/contrast-test-parameters-action/contrast-test-parameters-action.component';
// import { UserIdentificationActionComponent } from './actions/user-identification-action/user-identification-action.component';
// import { StepExecutionStatusListComponent } from './step-execution-status-list/step-execution-status-list.component';
// import { StepBuildFormComponent } from './step-build-form/step-build-form.component';
// import { PhotocellAdjustmentExecutionActionComponent } from './actions/photocell-adjustment-execution-action/photocell-adjustment-execution-action.component';
// import { LoadingDotsComponent } from './loading-dots/loading-dots.component';
// import { PhasesComponent } from './phases/phases.component';
// import { ContrastTestExecutionActionComponent } from './actions/contrast-test-execution-action/contrast-test-execution-action.component';
// import { StandResultComponent } from './stand-result/stand-result.component';
// import { DevicesComponent } from './devices/devices.component';
// import { LedComponent } from './led/led.component';
// import { ReportActionComponent } from './actions/report-action/report-action.component';
// import { ExecutionByEssayComponent } from './dashboard/execution-by-essay/execution-by-essay.component';
// import { MeterApprovesComponent } from './dashboard/meter-approves/meter-approves.component';
// import { StandUsedComponent } from './dashboard/stand-used/stand-used.component';
// import { HttpClientModule } from '@angular/common/http';
// import { VacuumTestExecutionActionComponent } from './actions/vacuum-test-execution-action/vacuum-test-execution-action.component';
// import { VacuumTestParametersActionComponent } from './actions/vacuum-test-parameters-action/vacuum-test-parameters-action.component';
// import { CommandLineComponent } from './command-line/command-line.component';
// import { BootTestParametersActionComponent } from './actions/boot-test-parameters-action/boot-test-parameters-action.component';
// import { BootTestExecutionActionComponent } from './actions/boot-test-execution-action/boot-test-execution-action.component';

const AppComponents = [
  PageTitleComponent,
  AbmComponent,
  ConfirmDialogComponent,
  MenuComponent,
  TabMenuTestComponent,
  ValidatorMessagesComponent,
  BootTestBuildFormComponent,
  PhaseFormGroupComponent,
  PreparationBuildFormComponent,
  ContrastTestBuildFormComponent,
  VacuumTestBuildFormComponent,
  InputErrorComponent,
  AddStepToSequenceComponent,
  StepsSequenceTableComponent,
  EditStepInSequenceComponent
];

@NgModule({
  declarations: [AppComponents],
  imports: [CommonModule, PrimeNgModule, PipesModule, ReactiveFormsModule],
  exports: [PrimeNgModule, AppComponents],
})
export class ComponentsModule {}
