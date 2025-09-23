import { PhasesToCommandPipe } from './../../../pipes/business/phases-to-command.pipe';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { APP_CONFIG } from '../../../../environments/environment';
import { GeneratorEnum } from '../../../models/business/enums/generator-enum.model';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { DeviceService } from '../../../services/device.service';
import { MessagesService } from '../../../services/messages.service';
import { Observable, tap, of } from 'rxjs';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';
import { Phase } from '../../../models/business/interafces/phase.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratorComponent<T extends EssayTemplateStep> extends MachineDeviceComponent implements OnInit {
    @Input() currentStep!: T;

    override readonly device = Devices.GEN;

    showDeviceStatus = false;
    readonly GeneratorEnum = GeneratorEnum;
    readonly generatorType = APP_CONFIG.generatorType;

    constructor(
        protected readonly deviceService: DeviceService,
        protected readonly messagesService: MessagesService,
        private phasesToCommandPipe: PhasesToCommandPipe
    ) {
        super(deviceService, messagesService);
    }

    start$(stepMeterConstant: MeterConstantEnum, phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): Observable<string> {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            return of('');
        }
        this.deviceStatus$.next(DeviceStatus.StartInProgress);
        const startCommand =
            stepMeterConstant === MeterConstantEnum.Active
                ? COMMANDS.Software.Generator.START_ACTIVA
                : COMMANDS.Software.Generator.START_REACTIVA;
        const commandBlocks: string[] = [startCommand];
        commandBlocks.push(...this.phasesToCommandPipe.transform(phaseL1, phaseL2, phaseL3));
        const command = this.buildCommand(...commandBlocks);
        return this.write$(command).pipe(tap(() => this.deviceStatus$.next(DeviceStatus.Working)));
    }

    stop$(): Observable<string> {
        if (APP_CONFIG.generatorType === GeneratorEnum.Manual) {
            return of('');
        }
        this.deviceStatus$.next(DeviceStatus.StopInProgress);
        return this.write$(this.buildCommand(COMMANDS.Software.Generator.STOP)).pipe(
            tap(() => this.deviceStatus$.next(DeviceStatus.Stopped))
        );
    }

    ngOnInit(): void {
        if (APP_CONFIG.generatorType === GeneratorEnum.SemiautomaticPYC5050) {
            this.showDeviceStatus = true;
        }
    }
}
