import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { PreparationStep } from '../../models/business/interafces/steps/preparation-step.model';
import {
  StandResult,
  StandStandResult,
} from '../../models/business/interafces/stand-result.model';
import {
  TC_AlignHorizontal,
  TableColumn,
  TableColumnTemplateContext,
} from '../../models/core/table-column.model';
import { StandMeterConstantPipe } from '../../pipes/business/stand-meter-constant.pipe';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';
import { MeterConstantPipe } from '../../pipes/business/meter-constant.pipe';

@Component({
  selector: 'app-stands-result',
  templateUrl: './stands-result.component.html',
  styleUrls: ['./stands-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandsResultComponent implements OnInit, OnChanges {
  @Input() preparationStep!: PreparationStep;
  @Input() results!: StandResult[];
  @Input() resultsColumn!: TableColumn<StandStandResult>;
  @Input() stepMeterConstant!: MeterConstantEnum;

  @ViewChild('columnResultStatus', { static: true })
  columnResultStatusTmp!: TemplateRef<
    TableColumnTemplateContext<StandStandResult>
  >;

  value: StandStandResult[] = [];
  columns: TableColumn<StandStandResult>[] = [];

  readonly meterConstantPipe = inject(MeterConstantPipe);
  readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.results) {
      this.value = this.getValues(
        changes.results.currentValue as StandResult[],
        this.preparationStep
      );
    }
    if (changes.preparationStep) {
      this.value = this.getValues(
        this.results,
        changes.preparationStep.currentValue as PreparationStep
      );
    }
  }

  ngOnInit(): void {
    this.columns = [
      {
        header: 'Puesto',
        field: (_, index) => (index + 1).toString().padStart(2, '0'),
        alignHorizontal: TC_AlignHorizontal.Number,
      },
      {
        header: 'Medidor',
        field: (item) => ('meter' in item ? item.meter?.label : ''),
        alignHorizontal: TC_AlignHorizontal.Text,
      },
      {
        header: 'Nº de serie',
        field: (item) => ('serialNumber' in item ? item.serialNumber : ''),
        alignHorizontal: TC_AlignHorizontal.Text,
      },
      {
        header: 'Año',
        field: (item) =>
          'yearOfProduction' in item ? item.yearOfProduction : '',
        alignHorizontal: TC_AlignHorizontal.Number,
      },
      {
        header: `Cte. (${this.meterConstantPipe.transform(
          this.stepMeterConstant
        )})`,
        field: (item): string => {
          if (this.stepMeterConstant === undefined) {
            return '';
          }
          if (!('meter' in item) || !item.meter) {
            return '';
          }
          return this.standMeterConstantPipe.transform(
            this.stepMeterConstant,
            item.meter
          );
        },
        alignHorizontal: TC_AlignHorizontal.Alphanumeric,
      },
      this.resultsColumn,
      {
        header: 'Resultado',
        template: this.columnResultStatusTmp,
        alignHorizontal: TC_AlignHorizontal.Text,
      },
    ];
  }

  private getValues(
    results: StandResult[],
    preparationStep: PreparationStep
  ): StandStandResult[] {
    if (!results?.length) {
      return [];
    }
    if (!preparationStep) {
      return [];
    }
    if (!preparationStep.form_control_raw?.length) {
      return [];
    }
    return results.map((result, index) => ({
      ...result,
      ...preparationStep.form_control_raw[index],
    }));
  }
}
