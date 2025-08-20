import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    VacuumTestEssayStep,
    VacuumTestStandResult
} from '../../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { switchMap, tap, finalize, Observable, Subject, takeUntil, of, map } from 'rxjs';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { CommandResultResponse, StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { APP_CONFIG } from '../../../../../environments/environment';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { GeneratorComponent } from '../../../machine/generator/generator.component';

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
        }
    };

    override readonly skipEnabled = APP_CONFIG.skipSteps.vacuumTestRun;

    private stopStep = new Subject<void>();

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    onManualGeneratorAdjusted(): void {
        this.tabIndex = 1;
        this.canExecute = true;
        this.startTest();
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

    override onRestart(): void {
        // recetea el contador
        this.countTimer.reset();
        this.generator.resetConfirmation();
    }

    override abort(): Observable<boolean> {
        this.stopStep.next();
        this.countTimer.stop();
        this.deviceService.abort();
        if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.calculator.deviceStatus$.value
            )
        ) {
            this.blockUIService.setBlocked(true);
            return this.calculator.stop$(this.getActiveStands()).pipe(
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false))
            );
        }
        return of(true);
    }

    override isFailCondition(result: VacuumTestStandResult): boolean {
        const maxAllowedPulses = this.currentStep.form_control_raw.maxAllowedPulses;
        return result.measuredPulses > maxAllowedPulses;
    }

    override startTest(): void {
        // recetea el contador
        this.countTimer.reset();
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
                .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
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
