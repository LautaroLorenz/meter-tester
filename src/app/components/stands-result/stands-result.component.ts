import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PreparationStep } from '../../models/business/interafces/steps/preparation-step.model';
import { StandResult } from '../../models/business/interafces/stand-result.model';
import { TableColumn } from '../../models/core/table-column.model';

@Component({
  selector: 'app-stands-result',
  templateUrl: './stands-result.component.html',
  styleUrls: ['./stands-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandsResultComponent {
  @Input() preparationStep!: PreparationStep;
  @Input() results!: StandResult[];

  value: any[] = []; // TODO poner el tipo correcto

  readonly columns: TableColumn[] = [
    {
      header: 'Puesto',
      field: (): string => {
        // TODO
        return '';
      },
    },
    {
      header: 'Marca',
      field: (): string => {
        // TODO
        return '';
      },
    },
    {
      header: 'Modelo',
      field: (): string => {
        // TODO
        return '';
      },
    },
    {
      header: 'Nº de serie',
      field: (): string => {
        // TODO
        return '';
      },
    },
    {
      header: 'Año de fabricación',
      field: (): string => {
        // TODO
        return '';
      },
    },
    {
      header: 'Constante',
      field: (): string => {
        // TODO
        return '';
      },
    },
  ];
}
