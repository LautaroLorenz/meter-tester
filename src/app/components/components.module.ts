import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from './primeng/primeng.module';
import { PageTitleComponent } from './page-title/page-title.component';
import { AbmComponent } from './abm/abm.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MenuComponent } from './menu/menu.component';
import { ValidatorMessagesComponent } from './validator-messages/validator-messages.component';
import { BootTestBuildFormComponent } from './build-steps/boot-test-build-form/boot-test-build-form.component';
import { PhaseFormGroupComponent } from './phase-form-group/phase-form-group.component';
import { PreparationBuildFormComponent } from './build-steps/preparation-build-form/preparation-build-form.component';
import { ContrastTestBuildFormComponent } from './build-steps/contrast-test-build-form/contrast-test-build-form.component';
import { VacuumTestBuildFormComponent } from './build-steps/vacuum-test-build-form/vacuum-test-build-form.component';
import { InputErrorComponent } from './input-error/input-error.component';
import { AddStepToSequenceComponent } from './add-step-to-sequence/add-step-to-sequence.component';
import { StepsSequenceTableComponent } from './steps-sequence-table/steps-sequence-table.component';
import { EditStepInSequenceComponent } from './edit-step-in-sequence/edit-step-in-sequence.component';
import { MajorStepTimelineComponent } from './timeline/major-step-timeline/major-step-timeline.component';
import { MajorStepTimelineItemComponent } from './timeline/major-step-timeline-item/major-step-timeline-item.component';
import { MajorStepSwitchComponent } from './major-steps/major-step-switch/major-step-switch.component';
import { VerificationMajorStepComponent } from './major-steps/verification-major-step/verification-major-step.component';
import { PreparationMajorStepComponent } from './major-steps/preparation-major-step/preparation-major-step.component';
import { ExecutionMajorStepComponent } from './major-steps/execution-major-step/execution-major-step.component';
import { ReportMajorStepComponent } from './major-steps/report-major-step/report-major-step.component';
import { StepTimelineComponent } from './timeline/step-timeline/step-timeline.component';
import { StepTimelineBadgeComponent } from './timeline/step-timeline-badge/step-timeline-badge.component';
import { VerifyStepInSequenceComponent } from './verify-step-in-sequence/verify-step-in-sequence.component';
import { StepSwitchComponent } from './build-steps/step-switch/step-switch.component';

const AppComponents = [
  PageTitleComponent,
  AbmComponent,
  ConfirmDialogComponent,
  MenuComponent,
  ValidatorMessagesComponent,
  BootTestBuildFormComponent,
  PhaseFormGroupComponent,
  PreparationBuildFormComponent,
  ContrastTestBuildFormComponent,
  VacuumTestBuildFormComponent,
  InputErrorComponent,
  AddStepToSequenceComponent,
  StepsSequenceTableComponent,
  EditStepInSequenceComponent,
  MajorStepTimelineComponent,
  MajorStepTimelineItemComponent,
  MajorStepSwitchComponent,
  VerificationMajorStepComponent,
  PreparationMajorStepComponent,
  ExecutionMajorStepComponent,
  ReportMajorStepComponent,
  StepTimelineComponent,
  StepTimelineBadgeComponent,
  VerifyStepInSequenceComponent,
  StepSwitchComponent,
];

@NgModule({
  declarations: [AppComponents],
  imports: [CommonModule, PrimeNgModule, PipesModule, ReactiveFormsModule],
  exports: [PrimeNgModule, AppComponents],
})
export class ComponentsModule {}
