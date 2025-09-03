import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { PatternStatus } from '../../../models/business/interafces/pattern-status.model';
import { Observable, ReplaySubject, map, tap, take, of } from 'rxjs';
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

@Component({
    selector: 'app-pattern',
    templateUrl: './pattern.component.html',
    styleUrls: ['./pattern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternComponent<T extends EssayTemplateStep> extends MachineDeviceComponent implements OnInit {
    @Input() currentStep!: T;
    @Input() toggleable!: boolean;
    override readonly device = Devices.PAT;

    readonly lastStatus$ = new ReplaySubject<PatternStatus>(1);

    private virtualConstants: VirtualPattern[] = [];

    constructor(
        protected readonly deviceService: DeviceService,
        protected readonly messagesService: MessagesService,
        protected readonly databaseService: DatabaseService<VirtualPattern>,
        private phasesToCommandPipe: PhasesToCommandPipe
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
            return of({ constant: virtualConstant });
        }
        if (APP_CONFIG.patternType === PatternEnum.Sm5050) {
            return this.constantWithParams$(stepMeterConstant, phaseL1, phaseL2, phaseL3);
        }
        // responder la constante obtenida desde el patrón físico.
        const stepMeterConstantBlock = this.getStepConstantBlock(stepMeterConstant);
        return this.write$(this.buildCommand(stepMeterConstantBlock)).pipe(
            map((response) => this.mapConstantResponse(response)),
            tap((patternStatus) => this.lastStatus$.next(patternStatus))
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
            tap((patternStatus) => this.lastStatus$.next(patternStatus))
        );
    }

    // Respuesta del patrón que incluye información del estado (además de la constante)
    private mapConstantResponseWithStatus(command: string): PatternStatus {
        const blocks = CommandDirector.getBlocks(command);
        const constant = Number(blocks[3]);
        return { constant };
    }

    private mapConstantResponse(command: string): PatternStatus {
        const blocks = CommandDirector.getBlocks(command);
        const constant = Number(blocks[3]);
        return { constant };
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
}
