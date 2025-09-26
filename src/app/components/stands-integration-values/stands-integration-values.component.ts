import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { TC_AlignHorizontal, TableColumn } from '../../models/core/table-column.model';

export interface InitialValueData {
    standNumber: string;
    meter: string;
    serialNumber: string;
    year: string;
    initialIntegrator: number | null;
    isActive: boolean;
}

@Component({
    selector: 'app-stands-integration-values',
    templateUrl: './stands-integration-values.component.html',
    styleUrls: ['./stands-integration-values.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class StandsIntegrationValuesComponent implements OnInit {
    @Input() initialValuesData: InitialValueData[] = [];
    @Output() initialIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();

    initialValuesColumns: TableColumn<InitialValueData>[] = [];

    ngOnInit(): void {
        this.initializeColumns();
    }

    /**
     * Maneja el cambio de valor en el integrador inicial
     */
    onInitialIntegratorChange(standIndex: number, value: number | null): void {
        // Solo permitir cambios en puestos activos
        if (this.initialValuesData[standIndex]?.isActive) {
            this.initialIntegratorChange.emit({
                standIndex,
                value: value || 0
            });
        }
    }

    /**
     * Inicializa las columnas de la tabla
     */
    private initializeColumns(): void {
        this.initialValuesColumns = [
            {
                header: 'Puesto',
                field: (item: InitialValueData) => item.standNumber,
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 60px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Medidor',
                field: (item: InitialValueData) => (item.isActive ? item.meter : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 200px;',
                customStyles: 'font-size: 0.75rem;'
            },
            {
                header: 'Nº de serie',
                field: (item: InitialValueData) => (item.isActive ? item.serialNumber : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 120px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Año',
                field: (item: InitialValueData) => (item.isActive ? item.year : ''),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 80px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Integrador inicial',
                field: 'initialIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 150px;',
                customStyles: 'text-align: center;'
            }
        ];
    }
}
