import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
    BootTestEssayStep,
    BootTestStandResult
} from '../../../../models/business/interafces/steps/boot-test-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { tap, switchMap, finalize, Observable, takeUntil, Subject, of, map } from 'rxjs';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { CommandResultResponse, StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { GeneratorComponent } from '../../../machine/generator/generator.component';

@Component({
    selector: 'app-boot-test-run',
    templateUrl: './boot-test-run.component.html',
    styleUrls: ['./boot-test-run.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootTestRunComponent extends TestRunComponent<BootTestEssayStep> implements OnDestroy {
    @ViewChild('countTimerMin', { static: true })
    countTimerMin!: CountTimerComponent;
    @ViewChild('countTimerMax', { static: true })
    countTimerMax!: CountTimerComponent;
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
    @ViewChild('pattern', { static: true }) pattern!: PatternComponent<BootTestEssayStep>;
    @ViewChild('generator', { static: true }) generator!: GeneratorComponent<BootTestEssayStep>;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Impulsos',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | BootTestStandResult;
            return 'measuredPulses' in realItem ? realItem.measuredPulses?.toString() : '';
        }
    };

    override readonly skipEnabled = APP_CONFIG.skipSteps.bootTestRun;

    private stopStep = new Subject<void>();

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    onGeneratorAdjustmentDone(): void {
        this.canExecute = true;
    }

    onMinTimerCountdownFinish(): void {
        // revisar si algún puesto pasa a estado Falló
        this.checkFailedStatus();
        // si todos los stands activos fallaron, detener ensayo
        if (this.isAllStandsFailed()) {
            this.stopTest();
        }
    }

    onMaxTimerCountdownFinish(): void {
        this.stopTest();
    }

    onCalculatorResults(results: CommandResultResponse[]): void {
        // descartar resultados fuera de tiempo
        if (!this.countTimerMax.isRunning) {
            return;
        }
        // update measuredPulses
        this.getActiveStands().forEach(({ index: standIndex }, resultIndex) => {
            const result: CommandResultResponse = results[resultIndex];
            // si no se recibe resultado, se limpia el valor actual
            if (result === undefined) {
                this.runEssayService
                    .getStandResult<BootTestStandResult>(this.currentStep.id, standIndex)
                    .patchValue({ measuredPulses: undefined });
                return;
            }
            this.runEssayService
                .getStandResult<BootTestStandResult>(this.currentStep.id, standIndex)
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

    override onRestart(): void {
        // recetea el contador
        this.countTimerMin.reset();
        this.countTimerMax.reset();
        this.generator.resetConfirmation();
    }

    override abort(): Observable<boolean> {
        this.stopStep.next();
        this.countTimerMin.stop();
        this.countTimerMax.stop();
        this.deviceService.abort();
        if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.calculator.deviceStatus$.value
            )
        ) {
            this.blockUIService.setBlocked(true);
            return this.calculator.stop$(this.getActiveStands()).pipe(
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        }
        return of(true);
    }

    override isFailCondition(result: BootTestStandResult): boolean {
        // Condición de corte por tiempo mínimo:
        // la cantidad de impulsos se iguala o supera antes de cumplir el tiempo mínimo.
        if (this.countTimerMin.isRunning) {
            if (result.measuredPulses >= this.currentStep.form_control_raw.allowedPulses) {
                return true;
            }
        }
        // Condición de corte por tiempo máximo:
        // la cantidad de impulsos no iguala ni supera a la mínima y no queda más tiempo.
        if (!this.countTimerMax.isRunning) {
            if (result.measuredPulses < this.currentStep.form_control_raw.allowedPulses) {
                return true;
            }
        }
        return false;
    }

    override startTest(): void {
        this.isExecuting = true;
        this.tabIndex = 1;
        this.canExecute = true;
        // recetea el contador
        this.countTimerMin.reset();
        this.countTimerMax.reset();
        // apaga el calculador por si estaba encendido
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                takeUntil(this.stopStep),
                // cambia el estado de los resultados en el calculador
                switchMap(() => this.calculator.reset$(this.getActiveStands())),
                // cambia el estado de los resultados en la pantalla
                tap(() => this.restartResults(ResultStatus.WorkInProgress)),
                // inicializa el contador
                tap(() => {
                    this.countTimerMin.start();
                    this.countTimerMax.start();
                }),
                // obtención de sultados en loop
                switchMap(() => this.getResultsLoop$())
            )
            .subscribe();
    }

    override stopTest(): void {
        this.stopStep.next();
        // detener contadores
        this.countTimerMin.stop();
        this.countTimerMax.stop();
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
        // todo lo que no está en estado Falló, pasa a estado Aprobado
        this.setApprovedStatus();
        this.cd.detectChanges();
    }

    override restartResults(resultStatus: ResultStatus): void {
        this.getActiveStands().forEach(({ index }) => {
            this.runEssayService
                .getStandResult<BootTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredPulses: undefined });
        });
        this.cd.detectChanges();
    }

    private getResultsLoop$(): Observable<CommandResultResponse[]> {
        return this.getResults$().pipe(
            takeUntil(this.onDestroy),
            takeUntil(this.stopStep),
            switchMap(() => this.getResultsLoop$())
        );
    }

    private getResults$(): Observable<CommandResultResponse[]> {
        return this.calculator
            .resultsTS02$(this.getActiveStands())
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }
}
