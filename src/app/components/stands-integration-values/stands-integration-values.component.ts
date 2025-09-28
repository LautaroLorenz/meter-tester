import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewEncapsulation,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { TC_AlignHorizontal, TableColumn, TableColumnTemplateContext } from '../../models/core/table-column.model';
import { formatHeaderWithUnits } from '../../utils/table-utils';

export interface IntegrationValue {
    standNumber: string;
    meter: string;
    serialNumber: string;
    year: string;
    initialIntegrator: number | null;
    finalIntegrator: number | null;
    calculatedError: number | null;
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
    @Input() integrationValues: IntegrationValue[] = [];
    @Input() disableInitialIntegrator = false;
    @Input() disableFinalIntegrator = false;
    @Input() disableCalculateError = false;
    @Input() disableManualApproval = false;
    @Input() disableManualRejection = false;

    @Output() initialIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();
    @Output() finalIntegratorChange = new EventEmitter<{ standIndex: number; value: number }>();
    @Output() calculateError = new EventEmitter<number | number[]>();
    @Output() manualApproval = new EventEmitter<number | number[]>();
    @Output() manualRejection = new EventEmitter<number | number[]>();

    @ViewChild('meterColumnTmp', { static: true })
    meterColumnTmp!: TemplateRef<TableColumnTemplateContext<IntegrationValue>>;

    columns: TableColumn<IntegrationValue>[] = [];

    ngOnInit(): void {
        this.initializeColumns();
    }

    /**
     * Verifica si un stand tiene valor inicial para habilitar el input de valor final
     */
    canInputFinalIntegrator(standIndex: number): boolean {
        const stand = this.integrationValues[standIndex];
        if (!stand || !stand.isActive) {
            return false;
        }

        return stand.initialIntegrator !== null && stand.initialIntegrator !== undefined;
    }

    /**
     * Verifica si un stand tiene tanto valor inicial como final para habilitar el cálculo
     */
    canCalculateError(standIndex: number): boolean {
        const stand = this.integrationValues[standIndex];
        if (!stand || !stand.isActive) {
            return false;
        }

        return (
            stand.initialIntegrator !== null &&
            stand.initialIntegrator !== undefined &&
            stand.finalIntegrator !== null &&
            stand.finalIntegrator !== undefined
        );
    }

    /**
     * Maneja el cambio de valor en el integrador inicial
     */
    onInitialIntegratorChange(standIndex: number, value: number | null): void {
        // Solo permitir cambios en puestos activos
        if (this.integrationValues[standIndex]?.isActive) {
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
        if (this.integrationValues[standIndex]?.isActive) {
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
        if (
            this.integrationValues[standIndex]?.isActive &&
            !this.disableCalculateError &&
            this.canCalculateError(standIndex)
        ) {
            this.calculateError.emit(standIndex);
        }
    }

    /**
     * Maneja el clic en el botón de aprobación manual
     */
    onManualApproval(standIndex: number): void {
        if (this.integrationValues[standIndex]?.isActive && !this.disableManualApproval) {
            this.manualApproval.emit(standIndex);
        }
    }

    /**
     * Maneja el clic en el botón de desaprobación manual
     */
    onManualRejection(standIndex: number): void {
        if (this.integrationValues[standIndex]?.isActive && !this.disableManualRejection) {
            this.manualRejection.emit(standIndex);
        }
    }

    /**
     * Limpia los valores de los inputs de integrador inicial, final y error calculado
     */
    clearInputs(): void {
        this.integrationValues.forEach((stand) => {
            if (stand.isActive) {
                stand.initialIntegrator = null;
                stand.finalIntegrator = null;
                stand.calculatedError = null;
            }
        });
    }

    /**
     * Verifica si se pueden calcular todos los errores
     */
    canCalculateAllErrors(): boolean {
        return this.integrationValues.some((stand, index) => stand.isActive && this.canCalculateError(index));
    }

    /**
     * Verifica si se pueden aprobar todos los stands
     */
    canApproveAll(): boolean {
        return this.integrationValues.some((stand) => stand.isActive && !this.disableManualApproval);
    }

    /**
     * Verifica si se pueden rechazar todos los stands
     */
    canRejectAll(): boolean {
        return this.integrationValues.some((stand) => stand.isActive && !this.disableManualRejection);
    }

    /**
     * Calcula el error para todos los stands que pueden ser calculados
     */
    onCalculateAllErrors(): void {
        const calculableStandIndexes = this.integrationValues
            .map((stand, index) => ({ stand, index }))
            .filter(({ stand, index }) => stand.isActive && this.canCalculateError(index))
            .map(({ index }) => index);

        if (calculableStandIndexes.length > 0) {
            this.calculateError.emit(calculableStandIndexes);
        }
    }

    /**
     * Aprueba todos los stands activos
     */
    onApproveAll(): void {
        const activeStandIndexes = this.integrationValues
            .map((stand, index) => ({ stand, index }))
            .filter(({ stand }) => stand.isActive && !this.disableManualApproval)
            .map(({ index }) => index);

        if (activeStandIndexes.length > 0) {
            this.manualApproval.emit(activeStandIndexes);
        }
    }

    /**
     * Rechaza todos los stands activos
     */
    onRejectAll(): void {
        const activeStandIndexes = this.integrationValues
            .map((stand, index) => ({ stand, index }))
            .filter(({ stand }) => stand.isActive && !this.disableManualRejection)
            .map(({ index }) => index);

        if (activeStandIndexes.length > 0) {
            this.manualRejection.emit(activeStandIndexes);
        }
    }

    /**
     * Inicializa las columnas de la tabla
     */
    private initializeColumns(): void {
        this.columns = [
            {
                header: formatHeaderWithUnits('Puesto'),
                field: (item: IntegrationValue) => item.standNumber,
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 60px; width: 60px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: formatHeaderWithUnits('Medidor'),
                template: this.meterColumnTmp,
                headerStyle: 'min-width: 150px; width: 150px;'
            },
            {
                header: formatHeaderWithUnits('Nº de serie'),
                field: (item: IntegrationValue) => (item.isActive ? item.serialNumber : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 120px; width: 120px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: formatHeaderWithUnits('Intg. Inicial [kWh]'),
                field: 'initialIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 132px; width: 132px;',
                customStyles: 'text-align: center;',
                headerTooltip: 'Integrador inicial [kWh]',
                tooltipStyleClass: 'tooltip-wide'
            },
            {
                header: formatHeaderWithUnits('Intg. Final [kWh]'),
                field: 'finalIntegrator',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 124px; width: 124px;',
                customStyles: 'text-align: center;',
                headerTooltip: 'Integrador final [kWh]',
                tooltipStyleClass: 'tooltip-wide'
            },
            {
                header: formatHeaderWithUnits('Error [%]'),
                field: (item: IntegrationValue) =>
                    item.isActive && item.calculatedError !== null ? item.calculatedError.toFixed(2) : '',
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 100px; width:100px;',
                customStyles: 'font-family: monospace; font-weight: 500; font-size: 0.75rem; text-align: center;'
            },
            {
                header: formatHeaderWithUnits('Resultado'),
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
