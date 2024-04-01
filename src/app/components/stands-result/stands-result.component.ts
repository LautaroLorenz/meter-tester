import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { PreparationStep } from '../../models/business/interafces/steps/preparation-step.model';
import {
  StandResult,
  StandStandResult,
} from '../../models/business/interafces/stand-result.model';
import { TableColumn } from '../../models/core/table-column.model';

@Component({
  selector: 'app-stands-result',
  templateUrl: './stands-result.component.html',
  styleUrls: ['./stands-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandsResultComponent implements OnInit, OnChanges {
  @Input() preparationStep!: PreparationStep;
  @Input() results!: StandResult[];
  @Input() resultColumnLabel!: string;

  value: StandStandResult[] = [];
  columns: TableColumn<StandStandResult>[] = [];

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
        field: (item) => ('name' in item ? item.name : ''),
      },
      {
        header: 'Medidor',
        field: (item) => ('meter' in item ? item.meter?.label : ''),
      },
      {
        header: 'Nº de serie',
        field: (item) => ('serialNumber' in item ? item.serialNumber : ''),
      },
      {
        header: 'Año',
        field: (item) =>
          'yearOfProduction' in item ? item.yearOfProduction : '',
      },
      {
        header: 'Constante', // TODO: usar el label adecuado
        field: (item): string => {
          // TODO obtener la constante que se usa en este paso.
          // TODO mostrar la constante con la unidad
          return '';
        },
      },
      {
        header: this.resultColumnLabel,
        field: (): string => {
          // TODO
          return '';
        },
      },
      {
        header: 'Resultado',
        field: (): string => {
          // TODO mostrar el estado del resultado (es un componente (aunque el componente se declara en el código de stand result), 
          // no solo un string :S)
          return '';
        },
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
