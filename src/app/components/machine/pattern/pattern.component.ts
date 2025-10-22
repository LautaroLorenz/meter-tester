import { SecondaryWindowService } from './../../../services/secondary-window.service';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter
} from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { PatternStatus } from '../../../models/business/interafces/pattern-status.model';
import { Observable, map, tap, take, of } from 'rxjs';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';
import { APP_CONFIG } from '../../../../environments/environment';
import { DeviceService } from '../../../services/device.service';
import { MessagesService } from '../../../services/messages.service';
import { DatabaseService } from '../../../services/database.service';
import { VirtualPattern, VirtualPatternDbTableContext } from '../../../models/business/database/virtual_pattern.model';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { PatternEnum } from '../../../models/business/enums/pattern-enum.model';
import { Phase } from '../../../models/business/interafces/phase.model';
import { PhasesToCommandPipe } from '../../../pipes/business/phases-to-command.pipe';
import { EMPTY_PHASE } from '../../../models/business/constants/phase-constants.model';
import { GeneratorAlarmType } from '../../../models/business/enums/generator-alarm-type.model';

@Component({
    selector: 'app-pattern',
    templateUrl: './pattern.component.html',
    styleUrls: ['./pattern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternComponent<T extends EssayTemplateStep> extends MachineDeviceComponent implements OnInit {
    @Input() currentStep!: T;
    @Input() toggleable!: boolean;
    @Output() alarmGenerador = new EventEmitter<GeneratorAlarmType>();
    override readonly device = Devices.PAT;

    hasRealTimeStatus = false;
    patternStatus: PatternStatus | null = null;
    readonly patternType: PatternEnum = APP_CONFIG.patternType;
    readonly PatternEnum = PatternEnum;

    private secondaryWindowId: number | null = null;
    private virtualConstants: VirtualPattern[] = [];
    private readonly PATTERN_WINDOW_URL = 'pattern-status-window';

    constructor(
        protected readonly deviceService: DeviceService,
        protected readonly messagesService: MessagesService,
        protected readonly databaseService: DatabaseService<VirtualPattern>,
        private phasesToCommandPipe: PhasesToCommandPipe,
        private cd: ChangeDetectorRef,
        private secondaryWindowService: SecondaryWindowService
    ) {
        super(deviceService, messagesService);
    }

    ngOnInit(): void {
        if (APP_CONFIG.patternType === PatternEnum.Virtual) {
            // obtener las constantes almacenadas en BBDD
            this.databaseService
                .getTable$(VirtualPatternDbTableContext.tableName)
                .pipe(
                    take(1),
                    tap(({ rows }) => (this.virtualConstants = rows.sort((a, b) => a.current - b.current)))
                )
                .subscribe();
        }
        if (APP_CONFIG.patternType === PatternEnum.Sm5050) {
            this.hasRealTimeStatus = true;
        }
        // conectamos con la ventana del patrón
        this.secondaryWindowService
            .isWindowReadyByUrl(this.PATTERN_WINDOW_URL)
            .then((isOpen) => {
                if (isOpen) {
                    this.secondaryWindowService
                        .getWindowIdByUrl(this.PATTERN_WINDOW_URL)
                        .then((windowId) => {
                            this.secondaryWindowId = windowId;
                        })
                        .catch(() => {});
                }
            })
            .catch(() => {});
    }

    constant$(
        stepMeterConstant: MeterConstantEnum,
        phaseL1: Phase,
        phaseL2: Phase,
        phaseL3: Phase
    ): Observable<PatternStatus> {
        // si es un patrón virtual, respondemos la constante virtual.
        if (APP_CONFIG.patternType === PatternEnum.Virtual) {
            // Tomamos la corriente mayor
            const corrienteL1 = phaseL1.current;
            const corrienteL2 = phaseL2.current;
            const corrienteL3 = phaseL3.current;
            const maxCurrent = Math.max(corrienteL1, corrienteL2, corrienteL3);

            const virtualConstant = this.getVirtualConstant(maxCurrent);
            return of({
                constant: virtualConstant,
                multiplier: 1,
                phaseL1: EMPTY_PHASE,
                phaseL2: EMPTY_PHASE,
                phaseL3: EMPTY_PHASE
            });
        }
        if (APP_CONFIG.patternType === PatternEnum.Sm5050) {
            return this.constantWithParams$(stepMeterConstant, phaseL1, phaseL2, phaseL3);
        }
        // responder la constante obtenida desde el patrón físico.
        const stepMeterConstantBlock = this.getStepConstantBlock(stepMeterConstant);
        return this.write$(this.buildCommand(stepMeterConstantBlock)).pipe(
            map((response) => this.mapConstantResponse(response)),
            tap((patternStatus) => this.updatePatternStatus(patternStatus))
        );
    }

    // Obtener constante del patrón seteando parámetros del ensayo
    constantWithParams$(
        stepMeterConstant: MeterConstantEnum,
        phaseL1: Phase,
        phaseL2: Phase,
        phaseL3: Phase
    ): Observable<PatternStatus> {
        const commandBlocks: string[] = [];
        const stepMeterConstantBlock = this.getStepConstantBlock(stepMeterConstant);
        commandBlocks.push(stepMeterConstantBlock);
        commandBlocks.push(...this.phasesToCommandPipe.transform(phaseL1, phaseL2, phaseL3));
        const command = this.buildCommand(...commandBlocks);

        // responder la constante obtenida desde el patrón físico.
        return this.write$(command).pipe(
            map((response) => this.mapConstantResponseWithStatus(response)),
            tap((patternStatus) => this.checkAlarms(patternStatus, phaseL1, phaseL2, phaseL3)),
            tap((patternStatus) => this.updatePatternStatus(patternStatus))
        );
    }

    async openSecondaryWindow(): Promise<void> {
        this.secondaryWindowId = await this.secondaryWindowService.openWindow(this.PATTERN_WINDOW_URL, {
            height: 260,
            width: 520,
            inspector: false,
            alwaysOnTop: true
        });
    }

    private mapConstantResponse(command: string): PatternStatus {
        const blocks = CommandDirector.getBlocks(command);
        const constant = Number(blocks[3]);
        return {
            constant,
            multiplier: 1,
            phaseL1: EMPTY_PHASE,
            phaseL2: EMPTY_PHASE,
            phaseL3: EMPTY_PHASE
        };
    }

    // Respuesta del patrón que incluye información del estado (además de la constante)
    private mapConstantResponseWithStatus(command: string): PatternStatus {
        const blocks = CommandDirector.getBlocks(command);

        // Decodificar la constante (bloque 2) - 4 bytes, 0 decimales (número entero)
        const constant = CommandDirector.decodeCompactNumber(blocks[2] || '\x00\x00\x00\x00', 0);

        // Multiplicador
        const multiplier = CommandDirector.decodeCompactNumber(blocks[3] || '\x00', 0);

        // Decodificar tensiones (bloques 3, 4, 5) - 2 bytes cada una con 1 decimal
        const voltageL1 = CommandDirector.decodeCompactNumber(blocks[4] || '\x00\x00', 1);
        const voltageL2 = CommandDirector.decodeCompactNumber(blocks[5] || '\x00\x00', 1);
        const voltageL3 = CommandDirector.decodeCompactNumber(blocks[6] || '\x00\x00', 1);

        // Decodificar corrientes (bloques 6, 7, 8) - 2 bytes cada una con 2 decimales
        const currentL1 = CommandDirector.decodeCompactNumber(blocks[7] || '\x00\x00', 2) / multiplier;
        const currentL2 = CommandDirector.decodeCompactNumber(blocks[8] || '\x00\x00', 2) / multiplier;
        const currentL3 = CommandDirector.decodeCompactNumber(blocks[9] || '\x00\x00', 2) / multiplier;

        // Decodificar factores de potencia (bloques 9, 10, 11) - 3 bytes cada uno
        const powerFactorL1 = CommandDirector.decodePowerFactor(blocks[10] || ' \x00L');
        const powerFactorL2 = CommandDirector.decodePowerFactor(blocks[11] || ' \x00L');
        const powerFactorL3 = CommandDirector.decodePowerFactor(blocks[12] || ' \x00L');

        return {
            constant,
            multiplier,
            phaseL1: {
                ...EMPTY_PHASE,
                voltage: voltageL1,
                current: currentL1,
                powerFactor: powerFactorL1.value,
                powerFactorLetter: powerFactorL1.type
            },
            phaseL2: {
                ...EMPTY_PHASE,
                voltage: voltageL2,
                current: currentL2,
                powerFactor: powerFactorL2.value,
                powerFactorLetter: powerFactorL2.type
            },
            phaseL3: {
                ...EMPTY_PHASE,
                voltage: voltageL3,
                current: currentL3,
                powerFactor: powerFactorL3.value,
                powerFactorLetter: powerFactorL3.type
            }
        };
    }

    private getStepConstantBlock(stepMeterConstant: MeterConstantEnum): string {
        switch (stepMeterConstant) {
            case MeterConstantEnum.Active:
                return 'A';
            case MeterConstantEnum.Reactive:
                return 'R';
        }
    }

    private getVirtualConstant(maxCurrent: number): number {
        if (!this.virtualConstants.length) {
            return 0;
        }
        const defaultConstant: number = this.virtualConstants[this.virtualConstants.length - 1]?.constant;
        let constant = defaultConstant;
        // Buscamos la constante inmediatamente mayor
        for (const virtualConstant of this.virtualConstants) {
            if (maxCurrent <= virtualConstant.current) {
                constant = virtualConstant.constant;
                break;
            }
        }
        return constant;
    }

    private checkAlarms(patternStatus: PatternStatus, phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): void {
        this.checkOvercurrentAlarm(patternStatus, phaseL1, phaseL2, phaseL3);
        // Aquí se pueden agregar más verificaciones de alarmas en el futuro
    }

    private checkOvercurrentAlarm(patternStatus: PatternStatus, phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): void {
        // Verificar si todas las corrientes del ensayo son menores o iguales a 2A
        const allCurrentsUnder2A = phaseL1.current <= 2.0 && phaseL2.current <= 2.0 && phaseL3.current <= 2.0;

        // Si todas las corrientes están bajo 2A, verificar si alguna supera 2.4A
        if (allCurrentsUnder2A) {
            const hasOvercurrent =
                patternStatus.phaseL1.current > 2.4 ||
                patternStatus.phaseL2.current > 2.4 ||
                patternStatus.phaseL3.current > 2.4;

            if (hasOvercurrent) {
                this.alarmGenerador.emit(GeneratorAlarmType.Overcurrent);
            }
        }
    }

    private updatePatternStatus(newPatternStatus: PatternStatus): void {
        this.patternStatus = newPatternStatus;
        this.cd.detectChanges();
        if (this.secondaryWindowId) {
            this.secondaryWindowService.sendToWindow(this.secondaryWindowId, {
                patternStatus: newPatternStatus,
                meterConstant: this.currentStep.form_control_raw.meterConstant
            });
        }
    }
}
