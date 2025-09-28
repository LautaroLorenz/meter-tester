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
    EMPTY,
    timer,
    filter
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
            const previousResultStatus = stand.getRawValue().resultStatus;

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

            // Si el stand pasa de sin resultado a Locked, detener ese stand individualmente
            if (
                this.stepRunMode === StepRunMode.finalResultLock &&
                resultStatus === ResultStatus.Locked &&
                previousResultStatus !== ResultStatus.Locked
            ) {
                // TODO eliminar console.log
                console.log('enviar stop a puesto', `${standIndex}`);
                this.calculator.stop$(standIndex).subscribe();
            }
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
            takeUntil(this.abortExecution$),
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
                takeUntil(this.abortExecution$),
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
        // Detener todos los loops y timers
        this.abortExecution$.next();
        this.stopStep.next();
        this.deviceService.abort();

        // Detener el generador inmediatamente para cortar el loop del patrón
        const stopGenerator$ = this.generator.stop$();

        if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.calculator.deviceStatus$.value
            ) ||
            (this.calculator.deviceStatus$.value === DeviceStatus.Stopped && this.isExecuting)
        ) {
            this.blockUIService.setBlocked(true);
            return this.calculator.stop$(this.getActiveStands()).pipe(
                switchMap(() => stopGenerator$),
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
            return stopGenerator$.pipe(
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        }

        // Si no hay dispositivos trabajando
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
                takeUntil(this.abortExecution$),
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

    override stepExecutionDone(essayStep: ContrastTestEssayStep): void {
        // Apagar el generador antes de continuar
        this.stopGenerator().subscribe(() => {
            // Llamar al método padre para marcar como Done
            super.stepExecutionDone(essayStep);
        });
    }

    override stopGenerator(): Observable<void> {
        // Bloquear la UI mientras se apaga el generador
        this.blockUIService.setBlocked(true);

        // Apagar el generador
        return this.generator.stop$().pipe(
            map(() => void 0),
            finalize(() => {
                this.blockUIService.setBlocked(false);
            })
        );
    }

    override restartResults(resultStatus: ResultStatus): void {
        this.getActiveStands().forEach(({ index }) => {
            this.runEssayService
                .getStandResult<ContrastTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredError: undefined });
        });
        this.cd.detectChanges();
    }

    protected getGeneratorComponent(): GeneratorComponent<ContrastTestEssayStep> {
        return this.generator;
    }

    protected getCalculatorComponent(): CalculatorComponent {
        return this.calculator;
    }

    protected getPatternComponent(): PatternComponent<ContrastTestEssayStep> {
        return this.pattern;
    }

    private getResultsLoop$(): Observable<CommandResultResponse[]> {
        return defer(() => this.getResults$()).pipe(
            repeat({
                delay: () =>
                    timer(APP_CONFIG.delays.resultsDelay).pipe(
                        takeUntil(this.abortExecution$),
                        takeUntil(this.stop$),
                        takeUntil(
                            this.calculator.deviceStatus$.pipe(
                                filter(
                                    (status) =>
                                        status === DeviceStatus.StopInProgress || status === DeviceStatus.Stopped
                                )
                            )
                        )
                    )
            }),
            takeUntil(this.abortExecution$),
            takeUntil(this.stop$)
        );
    }

    private getResults$(): Observable<CommandResultResponse[]> {
        // Obtener stands locked para no enviar comandos a ellos
        const lockedStands = new Set<number>();
        this.getActiveStands().forEach(({ index }) => {
            const stand = this.runEssayService.getStandResult<ContrastTestStandResult>(this.currentStep.id, index);
            if (stand.getRawValue().resultStatus === ResultStatus.Locked) {
                lockedStands.add(index);
            }
        });

        return this.calculator
            .resultsTS01$(
                this.getActiveStands(),
                this.pattern.patternStatus?.constant || 0,
                this.currentStep.form_control_raw.meterPulses,
                this.currentStep.form_control_raw.meterConstant,
                lockedStands
            )
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }
}
