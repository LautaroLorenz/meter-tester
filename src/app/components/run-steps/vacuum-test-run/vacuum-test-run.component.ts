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
import { PreparationStep } from '../../../models/business/interafces/steps/preparation-step.model';
import { RunEssayService } from '../../../services/run-essay.service';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../models/core/table-column.model';
import { StandStandResult } from '../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../models/business/enums/result-status.model';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent implements OnChanges {
  @Input() currentStep!: VacuumTestStep;
  @Input() preparationStep!: PreparationStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;

  vacuumStep!: VacuumTestEssayStep;

  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Impulsos',
    field: (item: StandStandResult): string => {
      const realItem: Stand | VacuumTestStandResult = item as
        | Stand
        | VacuumTestStandResult;
      return 'measuredPulses' in realItem
        ? realItem.measuredPulses?.toString()
        : '';
    },
  };

  constructor(private readonly runEssayService: RunEssayService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      this.vacuumStep = changes.currentStep.currentValue as VacuumTestEssayStep;
    }
  }

  manualGeneratorAdjusted(): void {
    this.startTest();
  }

  timerStop(): void {
    this.stopRunningStep();
    this.updateStandsStatus();
  }

  onCalculatorResults(results: number[]): void {
    // update measuredPulses
    for (let index = 0; index < results.length; index++) {
      const result: number = results[index];

      if (this.preparationStep.form_control_raw[index].isActive) {
        this.runEssayService
          .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
          .patchValue({ measuredPulses: result });
      }
    }
    // update result status
    this.updateStandsStatus();

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

  private startTest(): void {
    this.countTimer.reset();
    this.calculator
      .stop$()
      .pipe(
        switchMap(() =>
          this.calculator.start$(
            this.getStepCalculatorBlocks(),
            this.preparationStep.form_control_raw,
            this.currentStep.form_control_raw.meterConstant
          )
        ),
        tap(() => this.countTimer.start()),
        switchMap(() => this.calculator.results$()),
        tap((results) => this.onCalculatorResults(results))
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

  private updateStandsStatus(): void {
    for (
      let index = 0;
      index < this.preparationStep.form_control_raw.length;
      index++
    ) {
      const stand: Stand = this.preparationStep.form_control_raw[index];
      const result: VacuumTestStandResult = this.vacuumStep.standResults[index];
      if (stand.isActive) {
        this.runEssayService
          .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
          .patchValue({
            resultStatus: this.calculateStandStatus(
              result.measuredPulses,
              this.vacuumStep.form_control_raw.maxAllowedPulses as number
            ),
          });
      }
    }
  }

  private calculateStandStatus(
    measuredPulses: number,
    maxAllowedPulses: number
  ): ResultStatus {
    if (measuredPulses > maxAllowedPulses) {
      return ResultStatus.Failed;
    }
    if (this.countTimer.isRunning) {
      return ResultStatus.Pending;
    }
    return ResultStatus.Approved;
  }
}
