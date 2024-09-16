import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-pattern',
    templateUrl: './pattern.component.html',
    styleUrls: ['./pattern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternComponent extends MachineDeviceComponent implements OnInit {
    override readonly device = Devices.PAT;

    readonly lastStatus$ = new ReplaySubject<PatternStatus>(1);

    private virtualConstants: VirtualPattern[] = [];

    constructor(
        protected readonly deviceService: DeviceService,
        protected readonly messagesService: MessagesService,
        protected readonly databaseService: DatabaseService<VirtualPattern>
    ) {
        super(deviceService, messagesService);
    }

    ngOnInit(): void {
        if (APP_CONFIG.patternType === 'Virtual') {
            // obtener las constantes almacenadas en BBDD
            this.databaseService.getTable$(VirtualPatternDbTableContext.tableName).pipe(
                take(1),
                tap(({ rows }) => this.virtualConstants = rows.sort((a, b) => a.current - b.current))
            ).subscribe()
        }
    }

    constant$(stepMeterConstant: MeterConstantEnum, maxCurrent: number): Observable<PatternStatus> {
        // si es un patrón virtual, respondemos la constante virtual.
        if (APP_CONFIG.patternType === 'Virtual') {
            const virtualConstant = this.getVirtualConstant(maxCurrent);
            return of({ constant: virtualConstant })
        }
        // responder la constante obtenida desde el patrón físico.
        const stepMeterConstantBlock = this.getStepConstantBlock(stepMeterConstant);
        return this.write$(this.buildCommand(stepMeterConstantBlock)).pipe(
            map((response) => this.mapConstantResponse(response)),
            tap((patternStatus) => this.lastStatus$.next(patternStatus))
        );
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
