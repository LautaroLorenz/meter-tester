import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { APP_CONFIG } from '../../../../environments/environment';
import { GeneratorEnum } from '../../../models/business/enums/generator-enum.model';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { DeviceService } from '../../../services/device.service';
import { MessagesService } from '../../../services/messages.service';
import { Observable, tap, of } from 'rxjs';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { SoftwareGeneratorCommands } from '../../../models/business/enums/commands.model';
import { Phase } from '../../../models/business/interafces/phase.model';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratorComponent<T extends EssayTemplateStep> extends MachineDeviceComponent implements OnInit {
    @Input() currentStep!: T;
    @Output() adjustmentDone = new EventEmitter<void>();

    override readonly device = Devices.GEN;

    isAdjusted = false;
    showDeviceStatus = false;

    constructor(
        protected readonly deviceService: DeviceService,
        protected readonly messagesService: MessagesService
    ) {
        super(deviceService, messagesService);
    }

    start$(phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): Observable<string> {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            return of('');
        }
        this.deviceStatus$.next(DeviceStatus.StartInProgress);
        const commandBlocks: string[] = [SoftwareGeneratorCommands.START];

        // formatear la tensión
        const formatU = (voltage: number): string => {
            if (voltage === undefined || voltage === null || isNaN(voltage)) {
                return 'xxxx0000'; // valor por defecto
            }
            // Separar entero y decimal
            const [intPart, fracPart] = voltage.toFixed(1).split('.');
            // Entero con padding de 3 dígitos
            const intFormatted = intPart.padStart(3, '0');
            // Decimal (siempre un dígito)
            const fracFormatted = fracPart || '0';
            return `xxxx${intFormatted}${fracFormatted}`;
        };
        // formatear la corriente
        const formatI = (current: number): string => {
            if (current === undefined || current === null || isNaN(current)) {
                return 'xx000000';
            }
            // Asegura 3 decimales con redondeo
            const [intPart, fracPart] = Number(current).toFixed(3).split('.');
            // Entero a 3 dígitos (si por algún motivo excede, toma los últimos 3)
            const intFormatted = intPart.padStart(3, '0').slice(-3);
            // Decimales ya vienen con 3 dígitos por toFixed(3)
            const fracFormatted = (fracPart ?? '').padEnd(3, '0').slice(0, 3);
            return `xx${intFormatted}${fracFormatted}`;
        };
        // formatear la fase
        const formatPhi = (anglePhi: number): string => {
            if (anglePhi === undefined || anglePhi === null || isNaN(anglePhi)) {
                return 'xxx+0000';
            }
            // signo y magnitud (acotamos a 359.9 por seguridad)
            const sign = anglePhi >= 0 ? '+' : '-';
            const abs = Math.min(Math.abs(Number(anglePhi)), 359.9);
            // 3 enteros + 1 decimal, con padding
            const [intPart, fracPart] = abs.toFixed(1).split('.');
            const intFormatted = intPart.padStart(3, '0').slice(-3);
            const fracFormatted = (fracPart ?? '0').slice(0, 1).padEnd(1, '0');
            return `xxx${sign}${intFormatted}${fracFormatted}`;
        };

        commandBlocks.push(formatU(phaseL1.voltage));
        commandBlocks.push(formatU(phaseL2.voltage));
        commandBlocks.push(formatU(phaseL3.voltage));
        commandBlocks.push(formatI(phaseL1.current));
        commandBlocks.push(formatI(phaseL2.current));
        commandBlocks.push(formatI(phaseL3.current));
        commandBlocks.push(formatPhi(phaseL1.anglePhi));
        commandBlocks.push(formatPhi(phaseL2.anglePhi));
        commandBlocks.push(formatPhi(phaseL3.anglePhi));

        const command = this.buildCommand(...commandBlocks);
        return this.write$(command).pipe(tap(() => this.deviceStatus$.next(DeviceStatus.Working)));
    }

    // TODO
    // stop$(activeStands: ActiveStand[]): Observable<string[]> {
    //     const observables = activeStands.map(({ index }) => {
    //         const standNumber = (index + 1).toString().padStart(2, '0');
    //         const standBlock = `P${standNumber}`;
    //         const command = this.buildCommand(standBlock, SoftwareCalculatorCommands.STOP);
    //         return this.write$(command, () =>
    //             this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
    //         );
    //     });
    //     this.deviceStatus$.next(DeviceStatus.StopInProgress);
    //     return from(observables).pipe(
    //         concatMap((obs) => obs),
    //         toArray(),
    //         tap(() => this.deviceStatus$.next(DeviceStatus.Stopped))
    //     );
    // }

    ngOnInit(): void {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }
        if (APP_CONFIG.generatorType === GeneratorEnum.SemiautomaticPYC5050) {
            this.showDeviceStatus = true;
        }
        this.skip();
    }

    resetConfirmation(): void {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }
    }

    private skip(): void {
        if (!APP_CONFIG.skipSteps.generatorAdjusted) {
            return;
        }

        setTimeout(() => {
            this.isAdjusted = true;
            this.adjustmentDone.emit();
        }, 500);
    }
}
