import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
    ContrastTestEssayStep,
    ContrastTestStandResult
} from '../../../../models/business/interafces/steps/contrast-test-step.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { StepRunMode } from '../../../../models/business/enums/step-run-mode';
import { EnumAsOption } from '../../../../models/core/enum-as-option.model';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import {
    switchMap,
    Observable,
    tap,
    takeUntil,
    Subject,
    finalize,
    map,
    of,
    merge,
    defer,
    repeat,
    catchError,
    EMPTY
} from 'rxjs';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { CommandResultResponse, StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { GeneratorComponent } from '../../../machine/generator/generator.component';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';

@Component({
    selector: 'app-contrast-test-run',
    templateUrl: './contrast-test-run.component.html',
    styleUrls: ['./contrast-test-run.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> implements OnDestroy {
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
    @ViewChild('pattern', { static: true }) pattern!: PatternComponent<ContrastTestEssayStep>;
    @ViewChild('generator', { static: true }) generator!: GeneratorComponent<ContrastTestEssayStep>;

    override readonly skipEnabled = APP_CONFIG.skipSteps.contrastTestRun;

    stepRunMode = this.skipEnabled ? StepRunMode.finalResultLock : StepRunMode.continuousResultUpdate;

    readonly StepRunModes: EnumAsOption[] = this.EnumAsOptionPipe.transform('StepRunMode', StepRunMode);
    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Error [%]',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | ContrastTestStandResult;
            return 'measuredError' in realItem ? realItem.measuredError?.toFixed(2) : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };

    private stopStep = new Subject<void>();
    private readonly stop$ = merge(this.onDestroy, this.stopStep);

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    onCalculatorResults(results: CommandResultResponse[]): void {
        // update measured error
        this.getActiveStands().forEach(({ index: standIndex }, resultIndex) => {
            const stand = this.runEssayService.getStandResult<ContrastTestStandResult>(this.currentStep.id, standIndex);
            const result: CommandResultResponse = results[resultIndex];
            // si no se recibe resultado, se limpia el valor actual
            if (result === undefined) {
                stand.patchValue({ measuredError: undefined });
                return;
            }
            // bloqueo de resultado actual según modo de ejecución
            if (
                this.stepRunMode === StepRunMode.finalResultLock &&
                stand.getRawValue().resultStatus === ResultStatus.Locked
            ) {
                return;
            }
            // nuevo estado de resulado
            const resultStatus =
                // si el modo es bloqueo de resultado
                this.stepRunMode === StepRunMode.finalResultLock ? ResultStatus.Locked : ResultStatus.WorkInProgress;

            // actualización de resultado
            stand.patchValue({
                measuredError: result,
                resultStatus
            });
        });
        this.cd.detectChanges();
        // revisar si el modo de ejecución es bloqueo y todos los stands tienen resultado.
        if (this.stepRunMode === StepRunMode.finalResultLock && this.isAllStandsWithResultLocked()) {
            this.stopTest();
        }
    }

    /**
     * preparar el generador y el patrón
     */
    prepareGeneratorBeforeExecution(): void {
        // consulta la constante del patron en loop
        const getPatternConstantLoop$: Observable<PatternStatus> = defer(() =>
            this.pattern.constant$(
                this.currentStep.form_control_raw.meterConstant,
                this.currentStep.form_control_raw.phaseL1,
                this.currentStep.form_control_raw.phaseL2,
                this.currentStep.form_control_raw.phaseL3
            )
        ).pipe(
            // tap((result) => results), <- si fuera necesario consumir el pattern status
            // Repite indefinidamente tras completar (puedes agregar delay si querés)
            repeat({ delay: APP_CONFIG.delays.patternCheckCycleDelay }), // delay configurado por environment
            catchError(() => EMPTY), // evita romper el loop por errores
            takeUntil(this.onDestroy)
        );

        // inicializa el generador y luego consulta la constante del patrón en loop
        this.generator
            .start$(
                this.currentStep.form_control_raw.meterConstant,
                this.currentStep.form_control_raw.phaseL1,
                this.currentStep.form_control_raw.phaseL2,
                this.currentStep.form_control_raw.phaseL3
            )
            .pipe(
                takeUntil(this.onDestroy),
                tap(() => (this.canExecute = true)),
                switchMap(() => getPatternConstantLoop$)
            )
            .subscribe();
    }

    override onStepInit(): void {
        this.onRestart();
        this.prepareGeneratorBeforeExecution();
    }

    override onRestart(): void {
        this.stepRunMode = StepRunMode.continuousResultUpdate;
        this.canExecute = true;
    }

    override abort(): Observable<boolean> {
        this.stopStep.next();
        this.deviceService.abort();
        if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.calculator.deviceStatus$.value
            ) ||
            (this.calculator.deviceStatus$.value === DeviceStatus.Stopped && this.isExecuting)
        ) {
            this.blockUIService.setBlocked(true);
            return this.calculator.stop$(this.getActiveStands()).pipe(
                switchMap(() => this.generator.stop$()),
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        } else if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.generator.deviceStatus$.value
            )
        ) {
            this.blockUIService.setBlocked(true);
            return this.generator.stop$().pipe(
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        }
        return of(true);
    }

    override isFailCondition(result: ContrastTestStandResult): boolean {
        return Math.abs(result.measuredError) > this.currentStep.form_control_raw.maxAllowedError;
    }

    override startTest(): void {
        this.isExecuting = true;
        this.tabIndex = 1;
        // apaga el calculador por si estaba encendido
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                takeUntil(this.stop$),
                // cambia el estado de los resultados en el calculador
                switchMap(() => this.calculator.reset$(this.getActiveStands())),
                // cambia el estado de los resultados en la pantalla
                tap(() => this.restartResults(ResultStatus.WorkInProgress)),
                // obtención de sultados en loop
                switchMap(() => this.getResultsLoop$())
            )
            .subscribe();
    }

    override stopTest(): void {
        this.stopStep.next();
        // apagar puestos
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                finalize(() => {
                    // Puede continuar al siguiente step si todos los stands activos tienen
                    // un estado final (Aprobado o Falló)
                    this.canContinue = this.getCanContinue();
                    this.isExecuting = false;
                    this.cd.detectChanges();
                    if (this.canContinue) {
                        this.skip();
                    }
                })
            )
            .subscribe();
        // revisar si algún puesto pasa a estado Falló
        this.checkFailedStatus();
        // lo que no está en estado Falló, pasa a estado Aprobado
        this.setApprovedStatus();
        this.cd.detectChanges();
    }

    retryPrevious(): void {
        console.log('ContrastTestRunComponent - retryPrevious clicked');
        // TODO: Implement retry previous functionality
    }

    override stepExecutionDone(essayStep: ContrastTestEssayStep): void {
        // Bloquear la UI mientras se apaga el generador
        this.blockUIService.setBlocked(true);

        // Apagar el generador antes de continuar
        this.generator
            .stop$()
            .pipe(
                finalize(() => {
                    this.blockUIService.setBlocked(false);
                    // Llamar al método padre para continuar
                    super.stepExecutionDone(essayStep);
                })
            )
            .subscribe();
    }

    override restartResults(resultStatus: ResultStatus): void {
        this.getActiveStands().forEach(({ index }) => {
            this.runEssayService
                .getStandResult<ContrastTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredError: undefined });
        });
        this.cd.detectChanges();
    }

    private getResultsLoop$(): Observable<CommandResultResponse[]> {
        return this.getResults$().pipe(
            takeUntil(this.stop$),
            switchMap(() => this.getResultsLoop$())
        );
    }

    private getResults$(): Observable<CommandResultResponse[]> {
        return this.calculator
            .resultsTS01$(
                this.getActiveStands(),
                this.pattern.patternStatus?.constant || 0,
                this.currentStep.form_control_raw.meterPulses,
                this.currentStep.form_control_raw.meterConstant
            )
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }
}
