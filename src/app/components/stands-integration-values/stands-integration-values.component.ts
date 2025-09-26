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
    finalIntegrator: number | null;
    errorPercentage: number | null;
    resultStatus: any;
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
    @Input() disableInitialIntegrator = false;
    @Input() disableFinalIntegrator = false;
    @Input() disableCalculateError = false;
    @Input() disableManualApproval = false;
    @Input() disableManualRejection = false;
    @Output() initialIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();
    @Output() finalIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();
    @Output() calculateError = new EventEmitter<number>();
    @Output() manualApproval = new EventEmitter<number>();
    @Output() manualRejection = new EventEmitter<number>();

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
     * Maneja el cambio de valor en el integrador final
     */
    onFinalIntegratorChange(standIndex: number, value: number | null): void {
        // Solo permitir cambios en puestos activos
        if (this.initialValuesData[standIndex]?.isActive) {
            this.finalIntegratorChange.emit({
                standIndex,
                value: value || 0
            });
        }
    }

    /**
     * Maneja el clic en el botón de calcular error
     */
    onCalculateError(standIndex: number): void {
        if (this.initialValuesData[standIndex]?.isActive && !this.disableCalculateError) {
            this.calculateError.emit(standIndex);
        }
    }

    /**
     * Maneja el clic en el botón de aprobación manual
     */
    onManualApproval(standIndex: number): void {
        if (this.initialValuesData[standIndex]?.isActive && !this.disableManualApproval) {
            this.manualApproval.emit(standIndex);
        }
    }

    /**
     * Maneja el clic en el botón de desaprobación manual
     */
    onManualRejection(standIndex: number): void {
        if (this.initialValuesData[standIndex]?.isActive && !this.disableManualRejection) {
            this.manualRejection.emit(standIndex);
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
                headerStyle: 'min-width: 60px; width: 60px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Medidor',
                field: (item: InitialValueData) => (item.isActive ? item.meter : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 150px; width: 150px;',
                customStyles: 'font-size: 0.75rem;'
            },
            {
                header: 'Nº de serie',
                field: (item: InitialValueData) => (item.isActive ? item.serialNumber : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 120px; width: 120px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Integrador inicial',
                field: 'initialIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 142px; width: 142px;',
                customStyles: 'text-align: center; width: 134px;'
            },
            {
                header: 'Integrador final',
                field: 'finalIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 134px; width: 134px;',
                customStyles: 'text-align: center; width: 134px;'
            },
            {
                header: 'Error [%]',
                field: (item: InitialValueData) =>
                    item.isActive && item.errorPercentage !== null ? item.errorPercentage.toFixed(2) : '',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 100px; width:100px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem; text-align: center;'
            },
            {
                header: 'Resultado',
                field: 'resultStatus',
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 80px; width:100px;',
                customStyles: 'text-align: center;'
            },
            {
                header: '',
                field: 'actions',
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 120px; width: 120px;',
                customStyles: 'text-align: center;'
            }
        ];
    }
}
