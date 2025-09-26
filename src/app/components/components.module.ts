import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from './primeng/primeng.module';
import { PageTitleComponent } from './page-title/page-title.component';
import { AbmComponent } from './abm/abm.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { ValidatorMessagesComponent } from './validator-messages/validator-messages.component';
import { PhaseFormGroupComponent } from './phase-form-group/phase-form-group.component';
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
import { RunStepSwitchComponent } from './steps/run-steps/run-step-switch/run-step-switch.component';
import { PhotocellAdjusmentRequestComponent } from './photocell-adjusment-request/photocell-adjusment-request.component';
import { VacuumTestRunComponent } from './steps/run-steps/vacuum-test-run/vacuum-test-run.component';
import { CountTimerComponent } from './count-timer/count-timer.component';
import { AwaitUserConfirmComponent } from './await-user-confirm/await-user-confirm.component';
import { CalculatorComponent } from './machine/calculator/calculator.component';
import { DeviceStatusComponent } from './machine/device-status/device-status.component';
import { StandsResultComponent } from './stands-result/stands-result.component';
import { ResultStatusModule } from './result-status/result-status.module';
import { PatternComponent } from './machine/pattern/pattern.component';
import { BootTestBuildFormComponent } from './steps/build-steps/boot-test-build-form/boot-test-build-form.component';
import { PreparationBuildFormComponent } from './steps/build-steps/preparation-build-form/preparation-build-form.component';
import { ContrastTestBuildFormComponent } from './steps/build-steps/contrast-test-build-form/contrast-test-build-form.component';
import { VacuumTestBuildFormComponent } from './steps/build-steps/vacuum-test-build-form/vacuum-test-build-form.component';
import { BuildStepSwitchComponent } from './steps/build-steps/build-step-switch/build-step-switch.component';
import { VacuumTestParamsComponent } from './steps/step-params/vacuum-test-params/vacuum-test-params.component';
import { PdfPageComponent } from './steps/result-report/pdf-page/pdf-page.component';
import { ReportStepSwitchComponent } from './steps/result-report/report-step-switch/report-step-switch.component';
import { VacuumTestPdfReportComponent } from './steps/result-report/vacuum-test-pdf-report/vacuum-test-pdf-report.component';
import { BootTestRunComponent } from './steps/run-steps/boot-test-run/boot-test-run.component';
import { BootTestParamsComponent } from './steps/step-params/boot-test-params/boot-test-params.component';
import { BootTestPdfReportComponent } from './steps/result-report/boot-test-pdf-report/boot-test-pdf-report.component';
import { ContrastTestParamsComponent } from './steps/step-params/contrast-test-params/contrast-test-params.component';
import { ContrastTestRunComponent } from './steps/run-steps/contrast-test-run/contrast-test-run.component';
import { ContrastTestPdfReportComponent } from './steps/result-report/contrast-test-pdf-report/contrast-test-pdf-report.component';
import { RetryStepSelectionDialogComponent } from './steps/run-steps/retry-step-selection-dialog/retry-step-selection-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MeterDetailComponent } from './details/meter-detail/meter-detail.component';
import { StandUsedWidgetComponent } from './statics-widgets/stand-used-widget/stand-used-widget.component';
import { StaticWidgetComponent } from './statics-widgets/static-widget/static-widget.component';
import { ModelApprovedWidgetComponent } from './statics-widgets/model-approved-widget/model-approved-widget.component';
import { ModelFailedWidgetComponent } from './statics-widgets/model-failed-widget/model-failed-widget.component';
import { PhaseTableComponent } from './phase-table/phase-table.component';
import { HelpTextComponent } from './help-text/help-text.component';
import { ModelTestedWidgetComponent } from './statics-widgets/model-tested-widget/model-tested-widget.component';
import { CopyStandDialogComponent } from './copy-stand-dialog/copy-stand-dialog.component';
import { TableColumnModule } from './table-column/table-column.module';
import { ConfirmDialogModule } from './confirm-dialog/confirm-dialog.module';
import { BlockUiModule } from './block-ui/block-ui.module';
import { MenuModule } from './menu/menu.module';
import { GeneratorComponent } from './machine/generator/generator.component';
import { PatternStatusModule } from './machine/pattern/components/pattern-status/pattern-status.module';
import { ClampModule } from './clamp/clamp.module';
import { PreparationPdfReportComponent } from './steps/result-report/preparation-pdf-report/preparation-pdf-report.component';
import { IntegrationTestBuildFormComponent } from './steps/build-steps/integration-test-build-form/integration-test-build-form.component';
import { IntegrationTestParamsComponent } from './steps/step-params/integration-test-params/integration-test-params.component';
import { IntegrationTestRunComponent } from './steps/run-steps/integration-test-run/integration-test-run.component';
import { PulsesProgressBarComponent } from './pulses-progress-bar/pulses-progress-bar.component';
import { StandsIntegrationValuesModule } from './stands-integration-values/stands-integration-values.module';

const AppComponents = [
    PageTitleComponent,
    AbmComponent,
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
    BuildStepSwitchComponent,
    RunStepSwitchComponent,
    PhotocellAdjusmentRequestComponent,
    VacuumTestRunComponent,
    CountTimerComponent,
    VacuumTestParamsComponent,
    AwaitUserConfirmComponent,
    CalculatorComponent,
    DeviceStatusComponent,
    StandsResultComponent,
    PatternComponent,
    PdfPageComponent,
    ReportStepSwitchComponent,
    VacuumTestPdfReportComponent,
    BootTestRunComponent,
    BootTestParamsComponent,
    BootTestPdfReportComponent,
    ContrastTestParamsComponent,
    ContrastTestRunComponent,
    ContrastTestPdfReportComponent,
    RetryStepSelectionDialogComponent,
    PreparationPdfReportComponent,
    MeterDetailComponent,
    StandUsedWidgetComponent,
    StaticWidgetComponent,
    ModelApprovedWidgetComponent,
    ModelFailedWidgetComponent,
    ModelTestedWidgetComponent,
    PhaseTableComponent,
    HelpTextComponent,
    CopyStandDialogComponent,
    GeneratorComponent,
    IntegrationTestBuildFormComponent,
    IntegrationTestParamsComponent,
    IntegrationTestRunComponent,
    PulsesProgressBarComponent
];

const AppModules = [
    PrimeNgModule,
    TableColumnModule,
    ConfirmDialogModule,
    BlockUiModule,
    MenuModule,
    PatternStatusModule,
    ClampModule,
    StandsIntegrationValuesModule,
    ResultStatusModule
];

@NgModule({
    declarations: [AppComponents],
    imports: [CommonModule, PipesModule, ReactiveFormsModule, FormsModule, TranslateModule.forChild(), AppModules],
    exports: [AppComponents, AppModules]
})
export class ComponentsModule {}
