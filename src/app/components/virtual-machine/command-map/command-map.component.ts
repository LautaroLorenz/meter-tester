import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { DeviceConstants } from '../../../models/business/constants/devices-constant.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';

@Component({
    selector: 'app-command-map',
    templateUrl: './command-map.component.html',
    styleUrls: ['./command-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandMapComponent {
    readonly columns = [
        {
            header: 'Dispositivo',
            field: 'deviceName'
        },
        {
            header: 'Envía [start pattern]',
            field: 'startPattern'
        },
        {
            header: 'Respuesta',
            field: 'automaticResponse'
        }
    ];

    readonly COMMAND_START = `${CommandDirector.CHAR_START}${CommandDirector.DIVIDER}`;
    readonly COMMAND_END = `${CommandDirector.DIVIDER}${CommandDirector.CHAR_END}`;

    readonly map: VMCommandMap[] = [
        {
            device: Devices.GEN,
            deviceName: DeviceConstants[Devices.GEN],
            startPattern: `B\\|SG`,
            automaticResponse: `${this.COMMAND_START}${Devices.GEN}${Devices.STW}${CommandDirector.DIVIDER}${COMMANDS.Generator.ACK}${this.COMMAND_END}`
        },
        {
            device: Devices.PAT,
            deviceName: DeviceConstants[Devices.PAT],
            startPattern: `B\\|SP`,
            automaticResponse: this.getPatternAutomaticResponse()
        }
    ];

    get(command: string): VMCommandMap | undefined {
        return this.map.find((item) => {
            // Usar directamente el patrón ya escapado
            const regex = new RegExp(`^${item.startPattern}`);
            const matches = regex.test(command);
            return matches;
        });
    }

    private getPatternAutomaticResponse(): string {
        // B|PS|xKPx|UR|US|UT|IR|IS|IT|-PR|-PS|-PT|Z
        const blocks: string[] = [CommandDirector.CHAR_START, `${Devices.PAT}${Devices.STW}`];

        // xKPx
        blocks.push(CommandDirector.encodeCompactNumber(4294967295));

        // UR|US|UT
        blocks.push(CommandDirector.encodeCompactNumber(65535));
        blocks.push(CommandDirector.encodeCompactNumber(65535));
        blocks.push(CommandDirector.encodeCompactNumber(65535));

        // IR|IS|IT
        blocks.push(CommandDirector.encodeCompactNumber(65535));
        blocks.push(CommandDirector.encodeCompactNumber(65535));
        blocks.push(CommandDirector.encodeCompactNumber(65535));

        // -PR|-PS|-PT
        blocks.push(`-${CommandDirector.encodeCompactNumber(255)}L`);
        blocks.push(` ${CommandDirector.encodeCompactNumber(255)}C`);
        blocks.push(`-${CommandDirector.encodeCompactNumber(255)}L`);

        blocks.push(CommandDirector.CHAR_END);
        return blocks.join(CommandDirector.DIVIDER);
    }
}
