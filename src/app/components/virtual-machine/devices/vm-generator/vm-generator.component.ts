import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import { CommandBlockTypes } from '../../../../models/business/interafces/command-block.model';
import { GeneratorResponseCommands } from '../../../../models/business/enums/commands.model';

@Component({
    selector: 'app-vm-generator',
    templateUrl: './vm-generator.component.html',
    styleUrls: ['./vm-generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: VMDeviceComponent,
            useExisting: forwardRef(() => VmGeneratorComponent)
        }
    ]
})
export class VmGeneratorComponent extends VMDeviceComponent {
    override readonly device = Devices.GEN;
    override commandLines: CommandLine[] = [
        {
            id: 1,
            name: GeneratorResponseCommands.ACK,
            blocks: [
                {
                    type: CommandBlockTypes.Fixed,
                    value: `B|${Devices.GEN}${Devices.STW}|ACK |Z|x`
                }
            ]
        }
    ];
}
