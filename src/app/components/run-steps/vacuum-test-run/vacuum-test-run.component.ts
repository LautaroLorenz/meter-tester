import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  VacuumTestEssayStep,
  VacuumTestStandResult,
  VacuumTestStep,
} from '../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../machine/calculator/calculator.component';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { switchMap, tap } from 'rxjs';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../models/core/table-column.model';
import { StandStandResult } from '../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../models/business/class/test-run.model';
import { PatternComponent } from '../../machine/pattern/pattern.component';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent
  extends TestRunComponent
  implements OnChanges
{
  @Input() currentStep!: VacuumTestStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  vacuumStep!: VacuumTestEssayStep;

  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Impulsos',
    field: (item: StandStandResult): string => {
      const realItem = item as Stand | VacuumTestStandResult;
      return 'measuredPulses' in realItem
        ? realItem.measuredPulses?.toString()
        : '';
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      this.vacuumStep = changes.currentStep.currentValue as VacuumTestEssayStep;
    }
  }

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  onTimerCountdownFinish(): void {
    this.stopRunningStep();
    this.updateStandsResultStatus();
  }

  onCalculatorResults(results: number[]): void {
    // update measuredPulses
    this.getActiveStands().forEach(({ index }) => {
      const result: number = results[index];
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ measuredPulses: result });
    });

    // update result status
    this.updateStandsResultStatus();

    // si todos los stands activos fallaron, detener ensayo
    const isAllActiveStandsFailed = this.vacuumStep.standResults
      .filter(
        (_, index) => this.preparationStep.form_control_raw[index].isActive
      )
      .every(({ resultStatus }) => resultStatus === ResultStatus.Failed);
    if (isAllActiveStandsFailed) {
      this.stopRunningStep();
    }
  }

  private stopRunningStep(): void {
    this.countTimer.stop();
    this.calculator.stop$().subscribe();
  }

  private markStepAsDone(): void {
    // TODO
  }

  private restart(): void {
    // TODO setear todos los resultados de los stands activos en pending
  }

  private onDeactivate(): void {
    // TODO resolver situación cuando el usuario sale de la pantalla
    // TODO esto debería estar en TestRunComponent
  }

  private startTest(): void {
    // recetea el contador
    this.countTimer.reset();

    // apaga el calculador por si estaba encendido
    this.calculator
      .stop$()
      .pipe(
        // enciende el calculador
        switchMap(() =>
          this.calculator.start$(
            this.getStepCalculatorBlocks(),
            this.preparationStep.form_control_raw,
            this.currentStep.form_control_raw.meterConstant
          )
        ),
        // cambia el estado de los resultados
        tap(() => this.restartResults(ResultStatus.WorkInProgress)),
        // inicializa el contador
        tap(() => this.countTimer.start()),
        // consulta resultados del calculador en loop
        switchMap(() =>
          this.calculator
            .loopResults$()
            .pipe(tap((results) => this.onCalculatorResults(results)))
        )
        // TODO consulta estado del patrón en loop
      )
      .subscribe();
  }

  // TODO resolver de donde se obtiene la constante del patrón.
  private getStepCalculatorBlocks(): string[] {
    const stepTypeBlock = SoftwareCalculatorCommands.START_VACUUM;
    const patternConstantBlock = '1234567891';
    const maxAllowedPulsesBlock: string =
      this.vacuumStep.form_control_raw.maxAllowedPulses
        .toString()
        .padStart(8, '0');

    return [stepTypeBlock, patternConstantBlock, maxAllowedPulsesBlock];
  }

  private updateStandsResultStatus(): void {
    this.getActiveStands().forEach(({ index }) => {
      const result: VacuumTestStandResult = this.vacuumStep.standResults[index];
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({
          resultStatus: this.calculateStandStatus(
            result.measuredPulses,
            this.vacuumStep.form_control_raw.maxAllowedPulses as number
          ),
        });
    });
    this.cd.detectChanges();
  }

  private calculateStandStatus(
    measuredPulses: number,
    maxAllowedPulses: number
  ): ResultStatus {
    if (measuredPulses > maxAllowedPulses) {
      return ResultStatus.Failed;
    }
    if (this.countTimer.isRunning) {
      return ResultStatus.WorkInProgress;
    }
    return ResultStatus.Approved;
  }

  private restartResults(resultStatus: ResultStatus): void {
    this.getActiveStands().forEach(({ index }) => {
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ resultStatus, measuredPulses: 0 });
    });
    this.cd.detectChanges();
  }
}
