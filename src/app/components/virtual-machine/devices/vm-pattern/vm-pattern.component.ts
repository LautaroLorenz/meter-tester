import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import { PatternResponseCommands } from '../../../../models/business/enums/commands.model';
import { CommandBlockTypes } from '../../../../models/business/interafces/command-block.model';
import { CommandDirector } from '../../../../models/business/class/command-director.model';
import { CommandLineConfigTypes } from '../../../../models/business/interafces/command-block-config.model';

@Component({
  selector: 'app-vm-pattern',
  templateUrl: './vm-pattern.component.html',
  styleUrls: ['./vm-pattern.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: VMDeviceComponent,
      useExisting: forwardRef(() => VmPatternComponent),
    },
  ],
})
export class VmPatternComponent extends VMDeviceComponent {
  override readonly device = Devices.PAT;
  override commandLines: CommandLine[] = [
    {
      id: 1,
      name: PatternResponseCommands.CONSTANT,
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: `B|${Devices.PAT}|${Devices.STW}|`,
        },
        {
          type: CommandBlockTypes.Variable,
          endWith: CommandDirector.DIVIDER,
          value: '0000000000',
          variableValue: null,
          digitsQuantity: 10,
          padText: '0',
          config: {
            type: CommandLineConfigTypes.Random,
            probabilityOfChange: 25,
            minRandom: 0,
            maxRandom: 9999999999,
          },
        },
      ],
    },
  ];
}
