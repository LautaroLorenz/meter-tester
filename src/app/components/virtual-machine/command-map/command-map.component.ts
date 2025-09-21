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
            startPattern: `${this.COMMAND_START}${Devices.STW}${Devices.GEN}`,
            automaticResponse: `${this.COMMAND_START}${Devices.GEN}${Devices.STW}${CommandDirector.DIVIDER}${COMMANDS.Generator.ACK}${this.COMMAND_END}`
        }
    ];

    get(command: string): VMCommandMap | undefined {
        return this.map.find((item) => {
            try {
                const regex = new RegExp(item.startPattern);
                return regex.test(command);
            } catch (error) {
                // Si el startPattern no es una regex válida, hacer comparación exacta
                return item.startPattern === command;
            }
        });
    }
}
