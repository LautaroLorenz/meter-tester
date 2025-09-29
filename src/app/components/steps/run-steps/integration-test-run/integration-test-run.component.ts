import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import {
    IntegrationTestEssayStep,
    IntegrationTestStandResult
} from '../../../../models/business/interafces/steps/integration-test-step.model';
import { PulsesProgressBarComponent } from '../../../pulses-progress-bar/pulses-progress-bar.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { StandsIntegrationValuesComponent } from '../../../stands-integration-values/stands-integration-values.component';
import {
    switchMap,
    tap,
    finalize,
    Observable,
    Subject,
    takeUntil,
    of,
    map,
    merge,
    defer,
    repeat,
    catchError,
    EMPTY,
    timer,
    filter
} from 'rxjs';
import { IntegrationValue } from '../../../stands-integration-values/stands-integration-values.component';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { CommandResultResponse, StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { APP_CONFIG } from '../../../../../environments/environment';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { GeneratorComponent } from '../../../machine/generator/generator.component';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';
import { formatHeaderWithUnits } from '../../../../utils/table-utils';
import { StandMeterConstantPipe } from '../../../../pipes/business/stand-meter-constant.pipe';
import { MeterConstantUnitEnum } from '../../../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-integration-test-run',
    templateUrl: './integration-test-run.component.html',
    styleUrls: ['./integration-test-run.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationTestRunComponent
    extends TestRunComponent<IntegrationTestEssayStep>
    implements OnDestroy, OnInit
{
    @ViewChild('progressBar', { static: true }) progressBar!: PulsesProgressBarComponent;
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
    @ViewChild('pattern', { static: true }) pattern!: PatternComponent<IntegrationTestEssayStep>;
    @ViewChild('generator', { static: true }) generator!: GeneratorComponent<IntegrationTestEssayStep>;
    @ViewChild('standsIntegrationValues', { static: true }) standsIntegrationValues!: StandsIntegrationValuesComponent;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: formatHeaderWithUnits('Impulsos'),
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | IntegrationTestStandResult;
            return 'measuredPulses' in realItem ? realItem.measuredPulses?.toString() || '' : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };

    override readonly skipEnabled = APP_CONFIG.skipSteps.integrationTestRun;

    // Progress tracking properties
    isTestRunning = false;

    // Tab management
    tabIndex = 0;

    // Essay manual values table properties
    essayManualValues: IntegrationValue[] = [];

    // User input control
    isUserInputEnabled = false;

    private isPreparingForUserInput = false;
    private stopStep = new Subject<void>();
    private readonly stop$ = merge(this.onDestroy, this.stopStep);
    private readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

    // Getters for progress bar component
    get targetPulses(): number {
        return this.currentStep.form_control_raw.durationPulses;
    }

    get pulsesCounted(): number {
        const activeStands = this.getActiveStands();
        if (activeStands.length === 0) {
            return 0;
        }

        let minPulses = Number.MAX_SAFE_INTEGER;

        for (const { index: standIndex } of activeStands) {
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            const measuredPulses = standResult.measuredPulses as number;
            if (measuredPulses !== undefined) {
                minPulses = Math.min(minPulses, measuredPulses);
            } else {
                // If any active stand has no measurement, progress is 0
                return 0;
            }
        }

        return minPulses === Number.MAX_SAFE_INTEGER ? 0 : minPulses;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopStep.complete();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeEssayManualValuesTable();
    }

    /**
     * Maneja el cambio de valor en el integrador inicial
     */
    onInitialIntegratorChange(standIndex: number, value: number): void {
        if (this.essayManualValues[standIndex]) {
            // Actualizar el servicio
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({ initialIntegrator: value !== null && value !== undefined ? value : undefined });

            // Actualizar solo el valor en el array local sin crear nuevo array
            this.essayManualValues[standIndex].initialIntegrator = value !== null && value !== undefined ? value : null;
        }
    }

    /**
     * Maneja el cambio de valor en el integrador final
     */
    onFinalIntegratorChange(standIndex: number, value: number): void {
        if (this.essayManualValues[standIndex]) {
            // Actualizar el servicio
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({ finalIntegrator: value !== null && value !== undefined ? value : undefined });

            // Actualizar solo el valor en el array local sin crear nuevo array
            this.essayManualValues[standIndex].finalIntegrator = value !== null && value !== undefined ? value : null;
        }
    }

    /**
     * Maneja el clic en el botón de calcular error
     */
    onCalculateError(standIndexOrArray: number | number[]): void {
        const standIndexes = Array.isArray(standIndexOrArray) ? standIndexOrArray : [standIndexOrArray];

        // Procesar todos los stands en lote de forma optimizada
        this.processBatchCalculateError(standIndexes);
        this.cd.detectChanges();
    }

    /**
     * Maneja el clic en el botón de aprobación manual
     */
    onManualApproval(standIndexOrArray: number | number[]): void {
        const standIndexes = Array.isArray(standIndexOrArray) ? standIndexOrArray : [standIndexOrArray];

        // Procesar todos los stands en lote de forma optimizada
        this.processBatchApproval(standIndexes, ResultStatus.Approved, 0);
        this.cd.detectChanges();
    }

    /**
     * Maneja el clic en el botón de desaprobación manual
     */
    onManualRejection(standIndexOrArray: number | number[]): void {
        const standIndexes = Array.isArray(standIndexOrArray) ? standIndexOrArray : [standIndexOrArray];

        // Procesar todos los stands en lote de forma optimizada
        this.processBatchApproval(standIndexes, ResultStatus.Failed, 99.99);
        this.cd.detectChanges();
    }

    override onStepInit(): void {
        this.onRestart();
        this.prepareGeneratorBeforeExecution();
    }

    override onRestart(): void {
        // reset progress tracking
        this.isTestRunning = false;
        this.canExecute = true;

        // Poner todos los puestos en estado Pending y blanquear valores
        this.getActiveStands().forEach(({ index: standIndex }) => {
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({
                    resultStatus: ResultStatus.Pending,
                    initialIntegrator: undefined,
                    finalIntegrator: undefined,
                    measuredPulses: undefined,
                    calculatedError: undefined
                });
        });

        // Limpiar inputs usando el método del componente
        this.standsIntegrationValues.clearInputs();

        // Sincronizar el array local con los nuevos estados
        this.syncEssayManualValuesWithService();

        this.cd.detectChanges();
    }

    /**
     * Verifica si se puede confirmar el resultado (todos los stands activos tienen estado final)
     */
    canConfirmResult(): boolean {
        return this.hasAllStandsFinalStatus() && this.isUserInputEnabled;
    }

    /**
     * Maneja el clic en el botón de confirmar resultado
     */
    onConfirmResult(): void {
        if (this.canConfirmResult()) {
            this.stopTest();
        }
    }

    override abort(): Observable<boolean> {
        // Detener todos los loops y timers
        this.abortExecution$.next();
        this.stopStep.next();
        this.isTestRunning = false;
        this.deviceService.abort$().subscribe();

        // Detener el generador inmediatamente para cortar el loop del patrón
        const stopGenerator$ = this.generator.stop$();

        if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.calculator.deviceStatus$.value
            ) ||
            (this.calculator.deviceStatus$.value === DeviceStatus.Stopped && this.isExecuting)
        ) {
            this.blockUIService.setBlocked(true);
            return this.calculator.stop$(this.getActiveStands()).pipe(
                switchMap(() => stopGenerator$),
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        } else if (
            [DeviceStatus.Working, DeviceStatus.StartInProgress, DeviceStatus.StopInProgress].includes(
                this.generator.deviceStatus$.value
            )
        ) {
            this.blockUIService.setBlocked(true);
            return stopGenerator$.pipe(
                map(() => true),
                tap(() => this.blockUIService.setBlocked(false)),
                tap(() => (this.isExecuting = false))
            );
        }

        // Si no hay dispositivos trabajando
        return of(true);
    }

    override isFailCondition(result: IntegrationTestStandResult): boolean {
        const maxAllowedError = this.currentStep.form_control_raw.maxAllowedError;
        return Math.abs(result.calculatedError) > maxAllowedError;
    }

    override startTest(): void {
        // Verificar si hay valores iniciales faltantes
        if (this.hasMissingInitialValues()) {
            this.confirmationService.confirm({
                message: 'Algunos puestos no tienen valores iniciales.<br>¿Continuar sin completar estos valores?',
                header: 'Faltan valores iniciales',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Continuar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: 'p-button-warning',
                accept: () => {
                    this.executeStartTest();
                },
                reject: () => {
                    // Cambiar al tab de ingreso de valores cuando el usuario cancela
                    this.tabIndex = 1;
                    this.cd.detectChanges();
                }
            });
        } else {
            this.executeStartTest();
        }
    }

    override stopTest(): void {
        this.stopStep.next();
        // detener tracking de progreso
        this.isTestRunning = false;
        // resetear banderas para permitir reintentos
        this.isPreparingForUserInput = false;
        this.isUserInputEnabled = false;

        // Mostrar estado de carga en el botón continuar
        this.isStopTestInProgress = true;
        this.cd.detectChanges();

        // apagar puestos
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                finalize(() => {
                    // Ocultar estado de carga
                    this.isStopTestInProgress = false;
                    // Puede continuar al siguiente step si todos los stands activos tienen
                    // un estado final (Aprobado o Falló)
                    this.canContinue = this.getCanContinue();
                    this.isExecuting = false;
                    this.cd.detectChanges();
                    if (this.canContinue) {
                        this.skip();
                    }
                })
            )
            .subscribe();
    }

    override stepExecutionDone(essayStep: IntegrationTestEssayStep): void {
        // Apagar el generador antes de continuar
        this.stopGenerator().subscribe(() => {
            // Llamar al método padre para marcar como Done
            super.stepExecutionDone(essayStep);
        });
    }

    override stopGenerator(): Observable<void> {
        // Bloquear la UI mientras se apaga el generador
        this.blockUIService.setBlocked(true);

        // Apagar el generador
        return this.generator.stop$().pipe(
            map(() => void 0),
            finalize(() => {
                this.blockUIService.setBlocked(false);
            })
        );
    }

    override restartResults(resultStatus: ResultStatus): void {
        this.getActiveStands().forEach(({ index }) => {
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus, measuredPulses: undefined, calculatedError: undefined });
        });
        this.cd.detectChanges();
    }

    protected getGeneratorComponent(): GeneratorComponent<IntegrationTestEssayStep> {
        return this.generator;
    }

    protected getCalculatorComponent(): CalculatorComponent {
        return this.calculator;
    }

    protected getPatternComponent(): PatternComponent<IntegrationTestEssayStep> {
        return this.pattern;
    }

    private getResultsLoop$(): Observable<CommandResultResponse[]> {
        return defer(() => this.getResults$()).pipe(
            repeat({
                delay: () =>
                    timer(APP_CONFIG.delays.resultsDelay).pipe(
                        takeUntil(this.abortExecution$),
                        takeUntil(this.stop$),
                        takeUntil(
                            this.calculator.deviceStatus$.pipe(
                                filter(
                                    (status) =>
                                        status === DeviceStatus.StopInProgress || status === DeviceStatus.Stopped
                                )
                            )
                        )
                    )
            }),
            takeUntil(this.abortExecution$),
            takeUntil(this.stop$)
        );
    }

    /**
     * Verifica si hay stands activos sin valores iniciales ingresados
     */
    private hasMissingInitialValues(): boolean {
        const activeStands = this.getActiveStands();
        return activeStands.some(({ index }) => {
            const stand = this.essayManualValues[index];
            return !stand || stand.initialIntegrator === null || stand.initialIntegrator === undefined;
        });
    }

    /**
     * Ejecuta el inicio del test
     */
    private executeStartTest(): void {
        this.isExecuting = true;
        this.isTestRunning = true;
        this.tabIndex = 2; // Ahora el tab "Proceso de medición" está en el índice 2
        // apaga el calculador por si estaba encendido
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                takeUntil(this.abortExecution$),
                takeUntil(this.stop$),
                // cambia el estado de los resultados en el calculador
                switchMap(() => this.calculator.reset$(this.getActiveStands())),
                // cambia el estado de los resultados en la pantalla
                tap(() => this.restartResults(ResultStatus.WorkInProgress)),
                // hacer la primera consulta TS02
                switchMap(() => this.getResults$()),
                // después de la primera consulta, cambiar el generador a modo normal
                switchMap(() => this.switchGeneratorToNormalMode$()),
                // continuar con la obtención de resultados en loop
                switchMap(() => this.getResultsLoop$())
            )
            .subscribe();
    }

    /**
     * Cambia el generador de modo tensión a modo normal después de la primera consulta TS02
     */
    private switchGeneratorToNormalMode$(): Observable<string> {
        // Enviar comando start normal (no voltage mode) al generador
        return this.generator.start$(
            this.currentStep.form_control_raw.meterConstant,
            this.currentStep.form_control_raw.phaseL1,
            this.currentStep.form_control_raw.phaseL2,
            this.currentStep.form_control_raw.phaseL3
        );
    }

    private getResults$(): Observable<CommandResultResponse[]> {
        return this.calculator
            .resultsTS02$(this.getActiveStands())
            .pipe(tap((results) => this.onCalculatorResults(results)));
    }

    /**
     * Inicializa los datos de valores manuales del ensayo con todos los stands (activos e inactivos)
     */
    private initializeEssayManualValuesTable(): void {
        this.essayManualValues = this.preparationStep.form_control_raw.map((stand, index) => ({
            standNumber: (index + 1).toString().padStart(2, '0'),
            meter: stand.foreign?.meter?.label || '',
            serialNumber: stand.serialNumber || '',
            year: stand.yearOfProduction || '',
            initialIntegrator: null,
            finalIntegrator: null,
            calculatedError: null,
            resultStatus: null,
            isActive: stand.isActive
        }));
        this.syncEssayManualValuesWithService();
    }

    /**
     * Sincroniza los datos de valores manuales del ensayo con los valores del servicio
     */
    private syncEssayManualValuesWithService(): void {
        // Crear un nuevo array para que Angular detecte los cambios
        this.essayManualValues = this.essayManualValues.map((data, index) => {
            if (data.isActive) {
                const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                    this.currentStep.id,
                    index
                );
                const currentValue = standResult.value;

                // Retornar un nuevo objeto con los valores actualizados
                return {
                    ...data,
                    initialIntegrator: (currentValue?.initialIntegrator as number) ?? data.initialIntegrator,
                    finalIntegrator: (currentValue?.finalIntegrator as number) ?? data.finalIntegrator,
                    calculatedError: (currentValue?.calculatedError as number) ?? data.calculatedError,
                    resultStatus: currentValue?.resultStatus ?? data.resultStatus
                };
            }
            return data; // Retornar el objeto sin cambios para puestos inactivos
        });
    }

    /**
     * Procesa la aprobación/rechazo en lote de forma optimizada
     */
    private processBatchApproval(standIndexes: number[], resultStatus: ResultStatus, calculatedError: number): void {
        // Actualizar todos los stands en lote
        standIndexes.forEach((standIndex) => {
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({
                    resultStatus,
                    calculatedError
                });
        });

        // Sincronizar el array local con el nuevo estado una sola vez
        this.syncEssayManualValuesWithService();
    }

    /**
     * Calcula el error porcentual basado en los valores del integrador, impulsos medidos y constante del medidor
     * @param initialIntegrator Valor inicial del integrador (kWh)
     * @param finalIntegrator Valor final del integrador (kWh)
     * @param measuredPulses Impulsos medidos para ese puesto
     * @param meterConstant Constante del medidor que se está usando en el ensayo (activa o reactiva). Unidad y valor
     * @returns Error calculado limitado a un máximo de 99.99
     */
    private calculateError(
        initialIntegrator: number,
        finalIntegrator: number,
        measuredPulses: number,
        meterConstant: { unit: string; value: number }
    ): number {
        // Calcular la energía medida por el medidor (diferencia entre integrador final e inicial)
        const measuredEnergy = finalIntegrator - initialIntegrator;

        // Calcular la energía estimada basada en los impulsos medidos y la constante del medidor
        let estimatedEnergy: number;

        if (
            meterConstant.unit === MeterConstantUnitEnum.impKwh ||
            meterConstant.unit === MeterConstantUnitEnum.impKvarh
        ) {
            // Caso I: imp/kWh o imp/kvarh
            // Fórmula: Xs / km
            estimatedEnergy = measuredPulses / meterConstant.value;
        } else if (
            meterConstant.unit === MeterConstantUnitEnum.whImp ||
            meterConstant.unit === MeterConstantUnitEnum.varhImp
        ) {
            // Caso W: wh/imp o varh/imp
            // Fórmula: Xs * Km / 1000
            estimatedEnergy = (measuredPulses * meterConstant.value) / 1000;
        } else {
            // Fallback: si no se reconoce la unidad error máximo
            return 99.99;
        }

        // Calcular el error porcentual: (energía medida - energía estimada) / energía estimada * 100
        let calculatedError = 0;
        if (estimatedEnergy !== 0) {
            calculatedError = ((measuredEnergy - estimatedEnergy) / estimatedEnergy) * 100;
        }

        // Limitar el error calculado a un máximo de 99.99
        calculatedError = Math.min(Math.abs(calculatedError), 99.99) * Math.sign(calculatedError);

        return calculatedError;
    }

    /**
     * Procesa el cálculo de error en lote de forma optimizada
     */
    private processBatchCalculateError(standIndexes: number[]): void {
        const maxAllowedError = this.currentStep.form_control_raw.maxAllowedError;

        // Procesar todos los stands en lote
        standIndexes.forEach((standIndex) => {
            const essayStand = this.essayManualValues[standIndex];
            if (!essayStand || !essayStand.isActive) {
                return;
            }

            const initialIntegrator = essayStand.initialIntegrator;
            const finalIntegrator = essayStand.finalIntegrator;

            // Validar que ambos valores estén presentes
            if (
                initialIntegrator === null ||
                initialIntegrator === undefined ||
                finalIntegrator === null ||
                finalIntegrator === undefined
            ) {
                return;
            }

            // Obtener los impulsos medidos y la constante del medidor
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            const measuredPulses = (standResult.measuredPulses as number) || 0;

            // Obtener la información del medidor del puesto
            const preparationStand = this.preparationStep.form_control_raw[standIndex];
            const meter = preparationStand.foreign?.meter;
            const stepMeterConstant = this.currentStep.form_control_raw.meterConstant;

            // Obtener valor y unidad de la constante del medidor usando el pipe
            const meterConstantValue =
                Number(this.standMeterConstantPipe.transform(stepMeterConstant, meter, 'OnlyValue')) || 0;
            const meterConstantUnit = this.standMeterConstantPipe.transform(stepMeterConstant, meter, 'OnlyUnit');

            const meterConstant = {
                unit: meterConstantUnit,
                value: meterConstantValue
            };

            // Calcular el error usando la fórmula
            const calculatedError = this.calculateError(
                initialIntegrator,
                finalIntegrator,
                measuredPulses,
                meterConstant
            );

            // Determinar el estado basado en la comparación con maxAllowedError
            const resultStatus =
                Math.abs(calculatedError) > maxAllowedError ? ResultStatus.Failed : ResultStatus.Approved;

            // Actualizar el stand result con el error calculado y el estado
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({
                    calculatedError: calculatedError,
                    resultStatus: resultStatus
                });
        });

        // Sincronizar el array local con el nuevo estado una sola vez
        this.syncEssayManualValuesWithService();
    }

    /**
     * Prepara el entorno para que el usuario pueda ingresar los valores finales:
     * 1. Cambiar generador a modo voltage (corriente en 0)
     * 2. Hacer una consulta final de resultados (una sola vez, sin loop)
     * 3. Cambiar al tab "Ingreso de valores"
     * 4. Poner todos los stands en estado "Pending"
     * 5. Detener solo el calculador (sin hacer stopTest completo)
     *
     * Nota: Se usa la bandera isPreparingForUserInput para evitar loops del calculador
     */
    private prepareForUserInput(): void {
        // Cambiar el generador a modo voltage (corriente en 0)
        this.generator
            .startVoltageMode$(
                this.currentStep.form_control_raw.meterConstant,
                this.currentStep.form_control_raw.phaseL1,
                this.currentStep.form_control_raw.phaseL2,
                this.currentStep.form_control_raw.phaseL3
            )
            .pipe(
                // Cambiar el estado de los resultados a locked
                tap(() => {
                    this.getActiveStands().forEach(({ index }) => {
                        this.runEssayService
                            .getStandResult<IntegrationTestStandResult>(this.currentStep.id, index)
                            .patchValue({ resultStatus: ResultStatus.Finalizing });
                    });
                }),
                // Hacer una consulta final de resultados (una sola vez, sin loop)
                switchMap(() => this.getResults$()),
                // Cambiar al tab "Ingreso de valores" y poner stands en estado Pending
                tap(() => {
                    this.changeToManualValuesTab();
                    this.setStandsToPendingStatus();
                    // Habilitar el ingreso de valores finales
                    this.isUserInputEnabled = true;
                }),
                // Detener solo el calculador sin hacer stopTest completo
                tap(() => this.stopCalculator()),
                catchError(() => {
                    // En caso de error, detener el calculador de todas formas
                    this.stopCalculator();
                    return EMPTY;
                })
            )
            .subscribe();
    }

    /**
     * Detiene solo el calculador sin hacer stopTest completo
     */
    private stopCalculator(): void {
        this.calculator
            .stop$(this.getActiveStands())
            .pipe(
                finalize(() => {
                    this.cd.detectChanges();
                })
            )
            .subscribe();
    }

    /**
     * Cambia al tab "Ingreso de valores"
     */
    private changeToManualValuesTab(): void {
        this.tabIndex = 1; // Cambiar al tab "Ingreso de valores"
        this.cd.detectChanges();
    }

    /**
     * Pone todos los stands activos en estado "Pending"
     */
    private setStandsToPendingStatus(): void {
        this.getActiveStands().forEach(({ index }) => {
            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, index)
                .patchValue({ resultStatus: ResultStatus.Pending });
        });

        // Sincronizar el array local con los nuevos estados
        this.syncEssayManualValuesWithService();
        this.cd.detectChanges();
    }

    /**
     * Verifica si todos los stands activos tienen un estado final (aprobado o rechazado)
     */
    private hasAllStandsFinalStatus(): boolean {
        const activeStands = this.getActiveStands();
        if (activeStands.length === 0) {
            return false;
        }

        return activeStands.every(({ index: standIndex }) => {
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            return (
                standResult.resultStatus === ResultStatus.Approved || standResult.resultStatus === ResultStatus.Failed
            );
        });
    }

    /**
     * Verifica si todos los stands activos han alcanzado el mínimo de pulsos requeridos
     */
    private hasAllStandsReachedMinimumPulses(): boolean {
        const targetPulses = this.currentStep.form_control_raw.durationPulses;
        const activeStands = this.getActiveStands();

        if (activeStands.length === 0) {
            return false;
        }

        return activeStands.every(({ index: standIndex }) => {
            const standResult = this.runEssayService.getStandResult<IntegrationTestStandResult>(
                this.currentStep.id,
                standIndex
            ).value;
            const measuredPulses = standResult.measuredPulses as number;
            return measuredPulses !== undefined && measuredPulses >= targetPulses;
        });
    }

    private onCalculatorResults(results: CommandResultResponse[]): void {
        // descartar resultados fuera de tiempo
        if (!this.isTestRunning) {
            return;
        }

        // update measuredPulses and calculate calculatedError
        this.getActiveStands().forEach(({ index: standIndex }, resultIndex) => {
            const result: CommandResultResponse = results[resultIndex];
            // si no se recibe resultado, se limpia el valor actual
            if (result === undefined) {
                this.runEssayService
                    .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                    .patchValue({ measuredPulses: undefined, calculatedError: undefined });
                return;
            }

            // Calcular el error porcentual
            const measuredPulses = result;

            this.runEssayService
                .getStandResult<IntegrationTestStandResult>(this.currentStep.id, standIndex)
                .patchValue({ measuredPulses });
        });

        // Sincronizar los datos de la tabla con los valores del servicio
        this.syncEssayManualValuesWithService();
        this.cd.detectChanges();

        // Verificar si todos los stands activos han alcanzado el mínimo de pulsos requeridos
        if (this.hasAllStandsReachedMinimumPulses() && !this.isPreparingForUserInput) {
            this.isPreparingForUserInput = true;
            this.prepareForUserInput();
            return;
        }
    }

    /**
     * preparar el generador y el patrón
     */
    private prepareGeneratorBeforeExecution(): void {
        // consulta la constante del patron en loop
        const getPatternConstantLoop$: Observable<PatternStatus> = defer(() =>
            this.pattern.constant$(
                this.currentStep.form_control_raw.meterConstant,
                this.currentStep.form_control_raw.phaseL1,
                this.currentStep.form_control_raw.phaseL2,
                this.currentStep.form_control_raw.phaseL3
            )
        ).pipe(
            // tap((result) => results), <- si fuera necesario consumir el pattern status
            // Repite indefinidamente tras completar (puedes agregar delay si querés)
            repeat({ delay: APP_CONFIG.delays.patternCheckCycleDelay }), // delay configurado por environment
            catchError(() => EMPTY), // evita romper el loop por errores
            takeUntil(this.abortExecution$),
            takeUntil(this.onDestroy)
        );

        // inicializa el generador y luego consulta la constante del patrón en loop
        this.generator
            .startVoltageMode$(
                this.currentStep.form_control_raw.meterConstant,
                this.currentStep.form_control_raw.phaseL1,
                this.currentStep.form_control_raw.phaseL2,
                this.currentStep.form_control_raw.phaseL3
            )
            .pipe(
                takeUntil(this.abortExecution$),
                takeUntil(this.onDestroy),
                tap(() => (this.canExecute = true)),
                switchMap(() => getPatternConstantLoop$)
            )
            .subscribe();
    }
}
