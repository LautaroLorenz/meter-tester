import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TC_AlignHorizontal, TableColumn } from '../../models/core/table-column.model';

export interface InitialValueData {
    standNumber: string;
    meter: string;
    serialNumber: string;
    year: string;
    initialIntegrator: number;
}

@Component({
    selector: 'app-stands-initial-values',
    templateUrl: './stands-initial-values.component.html',
    styleUrls: ['./stands-initial-values.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandsInitialValuesComponent implements OnInit {
    @Input() initialValuesData: InitialValueData[] = [];
    @Output() initialIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();

    initialValuesColumns: TableColumn<InitialValueData>[] = [];

    ngOnInit(): void {
        this.initializeColumns();
    }

    /**
     * Maneja el cambio de valor en el integrador inicial
     */
    onInitialIntegratorChange(standIndex: number, value: number): void {
        this.initialIntegratorChange.emit({
            standIndex,
            value: value || 0
        });
    }

    /**
     * Inicializa las columnas de la tabla
     */
    private initializeColumns(): void {
        this.initialValuesColumns = [
            {
                header: 'Puesto',
                field: 'standNumber',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 60px;',
                customStyles: 'font-family: monospace; font-weight: 500;'
            },
            {
                header: 'Medidor',
                field: 'meter',
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 200px;',
                customStyles: 'text-left;'
            },
            {
                header: 'Nº de serie',
                field: 'serialNumber',
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 120px;',
                customStyles: 'font-family: monospace;'
            },
            {
                header: 'Año',
                field: 'year',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 80px;',
                customStyles: 'font-family: monospace;'
            },
            {
                header: 'Integrador inicial',
                field: 'initialIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 150px;',
                customStyles: 'text-center;'
            }
        ];
    }
}
