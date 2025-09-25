import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    VacuumTestEssayStep,
    VacuumTestStandResult
} from '../../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
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
    selector: 'app-vacuum-test-run',
    templateUrl: './vacuum-test-run.component.html',
    styleUrls: ['./vacuum-test-run.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacuumTestRunComponent extends TestRunComponent<VacuumTestEssayStep> implements OnDestroy {
    @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
    @ViewChild('pattern', { static: true }) pattern!: PatternComponent<VacuumTestEssayStep>;
    @ViewChild('generator', { static: true }) generator!: GeneratorComponent<VacuumTestEssayStep>;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Impulsos',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | VacuumTestStandResult;
            return 'measuredPulses' in realItem ? realItem.measuredPulses?.toString() : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };

    override readonly skipEnabled = APP_CONFIG.skipSteps.vacuumTestRun;

    private stopStep = new Subject<void>();
    private readonly stop$ = merge(this.onDestroy, this.stopStep);

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    onTimerCountdownFinish(): void {
        this.stopTest();
    }

    onCalculatorResults(results: CommandResultResponse[]): void {
        // descartar resultados fuera de tiempo
        if (!this.countTimer.isRunning) {
            return;
        }

        // update measuredPulses
        this.getActiveStands().forEach(({ index: standIndex }, resultIndex) => {
            const result: CommandResultResponse = results[resultIndex];
            // si no se recibe resultado, se limpia el valor actual
            if (result === undefined) {
                this.runEssayService
                    .getStandResult<VacuumTestStandResult>(this.currentStep.id, standIndex)
                    .patchValue({ measuredPulses: undefined });
                return;
            }
            this.runEssayService
                .getStandResult<VacuumTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({ measuredPulses: result });
        });
        this.cd.detectChanges();

        // revisar si algún puesto pasa a estado Falló
        this.checkFailedStatus();
        // si todos los stands activos fallaron, detener ensayo
        if (this.isAllStandsFailed()) {
            this.stopTest();
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
            takeUntil(this.onDestroy)
        );

        // inicializa el generador y luego consulta la constante del patrón en loop
        this.generator
            .start$(this.currentStep.form_control_raw.meterConstant, phaseL1, phaseL2, phaseL3)
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
        // recetea el contador
        this.countTimer.reset();
        this.canExecute = true;
    }

    override abort(): Observable<boolean> {
        this.stopStep.next();
        this.countTimer.stop();
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

    override isFailCondition(result: VacuumTestStandResult): boolean {
        const maxAllowedPulses = this.currentStep.form_control_raw.maxAllowedPulses;
        return result.measuredPulses > maxAllowedPulses;
    }

    override startTest(): void {
        this.isExecuting = true;
        this.tabIndex = 1;
        // recetea el contador
        this.countTimer.reset();
        // apaga el calculador por si estaba encendido
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                takeUntil(this.stop$),
                // cambia el estado de los resultados en el calculador
                switchMap(() => this.calculator.reset$(this.getActiveStands())),
                // cambia el estado de los resultados en la pantalla
                tap(() => this.restartResults(ResultStatus.WorkInProgress)),
                // inicializa el contador
                tap(() => {
                    this.countTimer.start();
                }),
                // obtención de sultados en loop
                switchMap(() => this.getResultsLoop$())
            )
            .subscribe();
    }

    override stopTest(): void {
        this.stopStep.next();
        // detener contadores
        this.countTimer.stop();
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
        console.log('VacuumTestRunComponent - retryPrevious clicked');
        // TODO: Implement retry previous functionality
    }

    override stepExecutionDone(essayStep: VacuumTestEssayStep): void {
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
                .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredPulses: undefined });
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
            .resultsTS02$(this.getActiveStands())
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }
}
