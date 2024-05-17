import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { Observable, take, tap, first, map } from 'rxjs';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { APP_CONFIG } from '../../../../environments/environment';
import { DatabaseService } from '../../../services/database.service';
import {
  Meter,
  MeterDbTableContext,
} from '../../../models/business/database/meter.model';
import { RelationsManager } from '../../../models/core/relations-manager.model';
import { FormArray } from '@angular/forms';
import { AbstractFormGroup } from '../../../models/core/abstract-form-group.model';
import { Stand } from '../../../models/business/interafces/stand.model';

@Component({
  selector: 'app-preparation-major-step',
  templateUrl: './preparation-major-step.component.html',
  styleUrls: ['./preparation-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationMajorStepComponent implements AfterViewInit {
  preparationStep: EssayStep | undefined;
  isPreparationDone = false;
  formValid = false;

  readonly StepStatus = StepStatus;

  constructor(
    private readonly runEssayService: RunEssayService,
    private readonly dbServiceMeter: DatabaseService<Meter>
  ) {}

  get isRunEssayFormValid(): boolean {
    return this.runEssayService.runEssayForm.valid;
  }

  get preparationStep$(): Observable<EssayStep> {
    return this.runEssayService.preparationStep$.pipe(
      tap((preparationStep) => (this.preparationStep = preparationStep))
    );
  }

  ngAfterViewInit(): void {
    this.skip();
  }

  onFormValueChange(essayTemplateStep: EssayTemplateStep): void {
    this.runEssayService
      .getEssayStep(essayTemplateStep.id)
      ?.patchValue(essayTemplateStep as EssayStep);
  }

  markVerifiedStep(essayStep: EssayStep): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('verifiedStatus')
      ?.setValue(StepStatus.Done);

    this.isPreparationDone = MajorStepsDirector.checkMajorStepStatus(
      this.preparationStep || [],
      StepStatus.Done,
      'verifiedStatus'
    );
  }

  /**
   * En base a los meter_id seleccionados, asignar a cada stand la informacion del modelo de medidor
   */
  assignMetersToStands$(): Observable<EssayStep> {
    // Obtener los medidores para asignarlos a los stands del preparation step
    return this.dbServiceMeter
      .getTable$(MeterDbTableContext.tableName, {
        relations: MeterDbTableContext.foreignTables,
      })
      .pipe(
        first(),
        map(({ rows, relations }) =>
          RelationsManager.mergeRelationsIntoRows<Meter>(
            rows,
            relations,
            MeterDbTableContext.foreignTables
          )
        ),
        map((meters) => {
          if (!this.preparationStep) {
            throw new Error('Paso de preparación no encontrado');
          }
          const preparationEssayStepForm = this.runEssayService.getEssayStep(
            this.preparationStep.id
          );
          (
            preparationEssayStepForm.get('form_control_raw') as FormArray<
              AbstractFormGroup<Stand>
            >
          ).controls.forEach((standControl) => {
            const meter = meters.find(
              ({ id }) => standControl.getRawValue().meter_id === id
            );
            if (meter && standControl.controls.meter_id) {
              standControl.get('foreign')?.setValue(
                {
                  meter: {
                    ...meter,
                    label: `${meter.foreign.brand.name} - ${meter.model}`,
                  },
                },
                { emitEvent: false }
              );
            }
          });
          return this.preparationStep;
        })
      );
  }

  continue(): void {
    if (!this.preparationStep) {
      return;
    }
    this.assignMetersToStands$().subscribe({
      next: (preparationStep) => {
        this.markVerifiedStep(preparationStep);
        this.runEssayService.nextMajorStep();
      },
    });
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps.preparationMajorStep) {
      return;
    }
    if (!this.formValid) {
      return;
    }

    this.preparationStep$.pipe(take(1)).subscribe(() => {
      setTimeout(() => this.continue());
    });
  }
}
