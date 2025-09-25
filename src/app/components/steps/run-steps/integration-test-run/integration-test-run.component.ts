import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    IntegrationTestEssayStep,
    IntegrationTestStandResult
} from '../../../../models/business/interafces/steps/integration-test-step.model';
import { PulsesProgressBarComponent } from '../../../pulses-progress-bar/pulses-progress-bar.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import {
    switchMap,
    tap,
    finalize,
    Observable,
    Subject,
    takeUntil,
    of,
    map,
    merge,
    defer,
    repeat,
    catchError,
    EMPTY
} from 'rxjs';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { CommandResultResponse, StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { APP_CONFIG } from '../../../../../environments/environment';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { GeneratorComponent } from '../../../machine/generator/generator.component';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';
import { Phase } from '../../../../models/business/interafces/phase.model';

@Component({
    selector: 'app-integration-test-run',
    templateUrl: './integration-test-run.component.html',
    styleUrls: ['./integration-test-run.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationTestRunComponent extends TestRunComponent<IntegrationTestEssayStep> implements OnDestroy {
    @ViewChild('progressBar', { static: true }) progressBar!: PulsesProgressBarComponent;
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
    @ViewChild('pattern', { static: true }) pattern!: PatternComponent<IntegrationTestEssayStep>;
    @ViewChild('generator', { static: true }) generator!: GeneratorComponent<IntegrationTestEssayStep>;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Error (%)',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | IntegrationTestStandResult;
            return 'calculatedError' in realItem ? realItem.calculatedError?.toString() || '' : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };

    override readonly skipEnabled = APP_CONFIG.skipSteps.integrationTestRun;

    // Progress tracking properties
    isTestRunning = false;

    private stopStep = new Subject<void>();
    private readonly stop$ = merge(this.onDestroy, this.stopStep);

    // Getters for progress bar component
    get targetPulses(): number {
        return this.currentStep.form_control_raw.durationPulses;
    }

    get pulsesCounted(): number {
        const activeStands = this.getActiveStands();
        if (activeStands.length === 0) {
            return 0;
        }

        let minPulses = Number.MAX_SAFE_INTEGER;

        for (const { index: standIndex } of activeStands) {
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            const measuredPulses = standResult.measuredPulses as number;
            if (measuredPulses !== undefined) {
                minPulses = Math.min(minPulses, measuredPulses);
            } else {
                // If any active stand has no measurement, progress is 0
                return 0;
            }
        }

        return minPulses === Number.MAX_SAFE_INTEGER ? 0 : minPulses;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    /**
     * Verifica si todos los stands activos han alcanzado el mínimo de pulsos requeridos
     */
    hasAllStandsReachedMinimumPulses(): boolean {
        const targetPulses = this.currentStep.form_control_raw.durationPulses;
        const activeStands = this.getActiveStands();

        if (activeStands.length === 0) {
            return false;
        }

        return activeStands.every(({ index: standIndex }) => {
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            const measuredPulses = standResult.measuredPulses as number;
            return measuredPulses !== undefined && measuredPulses >= targetPulses;
        });
    }

    onCalculatorResults(results: CommandResultResponse[]): void {
        // descartar resultados fuera de tiempo
        if (!this.isTestRunning) {
            return;
        }

        // update measuredPulses and calculate calculatedError
        this.getActiveStands().forEach(({ index: standIndex }, resultIndex) => {
            const result: CommandResultResponse = results[resultIndex];
            // si no se recibe resultado, se limpia el valor actual
            if (result === undefined) {
                this.runEssayService
                    .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                    .patchValue({ measuredPulses: undefined, calculatedError: undefined });
                return;
            }

            // Calcular el error porcentual
            const measuredPulses = result;
            const expectedPulses = this.currentStep.form_control_raw.durationPulses;
            const calculatedError = expectedPulses > 0 ? ((measuredPulses - expectedPulses) / expectedPulses) * 100 : 0;

            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({ measuredPulses, calculatedError });
        });
        this.cd.detectChanges();

        // Verificar si todos los stands activos han alcanzado el mínimo de pulsos requeridos
        if (this.hasAllStandsReachedMinimumPulses()) {
            this.stopTest();
            return;
        }
    }

    /**
     * preparar el generador y el patrón
     */
    prepareGeneratorBeforeExecution(): void {
        const phaseL1: Phase = {
            ...this.currentStep.form_control_raw.phaseL1,
            isActive: true,
            anglePhi: 0,
            current: 0,
            powerFactor: 0,
            powerFactorLetter: 'L'
        };
        const phaseL2: Phase = {
            ...this.currentStep.form_control_raw.phaseL2,
            isActive: true,
            anglePhi: 0,
            current: 0,
            powerFactor: 0,
            powerFactorLetter: 'L'
        };
        const phaseL3: Phase = {
            ...this.currentStep.form_control_raw.phaseL3,
            isActive: true,
            anglePhi: 0,
            current: 0,
            powerFactor: 0,
            powerFactorLetter: 'L'
        };
        // consulta la constante del patron en loop
        const getPatternConstantLoop$: Observable<PatternStatus> = defer(() =>
            this.pattern.constant$(this.currentStep.form_control_raw.meterConstant, phaseL1, phaseL2, phaseL3)
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
            .start$(this.currentStep.form_control_raw.meterConstant, phaseL1, phaseL2, phaseL3)
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
        // reset progress tracking
        this.isTestRunning = false;
        this.canExecute = true;
    }

    override abort(): Observable<boolean> {
        this.abortExecution$.next();
        this.stopStep.next();
        this.isTestRunning = false;
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

    override isFailCondition(result: IntegrationTestStandResult): boolean {
        const maxAllowedError = this.currentStep.form_control_raw.maxAllowedError;
        return Math.abs(result.calculatedError) > maxAllowedError;
    }

    override startTest(): void {
        this.isExecuting = true;
        this.isTestRunning = true;
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
                // obtención de resultados en loop
                switchMap(() => this.getResultsLoop$())
            )
            .subscribe();
    }

    override stopTest(): void {
        this.stopStep.next();
        // detener tracking de progreso
        this.isTestRunning = false;
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

    override stepExecutionDone(essayStep: IntegrationTestEssayStep): void {
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
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredPulses: undefined, calculatedError: undefined });
        });
        this.cd.detectChanges();
    }

    protected getGeneratorComponent(): GeneratorComponent<IntegrationTestEssayStep> {
        return this.generator;
    }

    protected getCalculatorComponent(): CalculatorComponent {
        return this.calculator;
    }

    protected getPatternComponent(): PatternComponent<IntegrationTestEssayStep> {
        return this.pattern;
    }

    private getResultsLoop$(): Observable<CommandResultResponse[]> {
        return this.getResults$().pipe(
            takeUntil(this.abortExecution$),
            takeUntil(this.stop$),
            switchMap(() => this.getResultsLoop$())
        );
    }

    private getResults$(): Observable<CommandResultResponse[]> {
        return this.calculator
            .resultsTS02$(this.getActiveStands())
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }
}
