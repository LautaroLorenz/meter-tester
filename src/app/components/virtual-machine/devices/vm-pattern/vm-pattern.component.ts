import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import { PatternResponseCommands } from '../../../../models/business/enums/commands.model';
import {
  CommandBlock,
  CommandBlockTypes,
} from '../../../../models/business/interafces/command-block.model';
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
      name: PatternResponseCommands.STATUS,
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|PAT|STW|',
        },
        {
          type: CommandBlockTypes.Variable,
          endWith: CommandDirector.DIVIDER,
          value: '',
          variableValue: 0,
          digitsQuantity: 10,
          padText: '0',
          config: {
            type: CommandLineConfigTypes.Random,
            probabilityOfChange: 25,
            minRandom: 0,
            maxRandom: 9999999999,
          },
        },
        this.voltageBlock(),
        this.voltageBlock(),
        this.voltageBlock(),
        this.currentBlock(),
        this.currentBlock(),
        this.currentBlock(),
        this.phaseBlockSign(),
        this.phaseBlock(),
        this.phaseBlockSign(),
        this.phaseBlock(),
        this.phaseBlockSign(),
        this.phaseBlock(),
      ],
    },
  ];

  private voltageBlock(): CommandBlock {
    return {
      type: CommandBlockTypes.Variable,
      endWith: CommandDirector.DIVIDER,
      value: '',
      variableValue: 0,
      digitsQuantity: 8,
      padText: 'x',
      config: {
        type: CommandLineConfigTypes.Random,
        probabilityOfChange: 40,
        minRandom: 0,
        maxRandom: 9999,
      },
    };
  }

  private currentBlock(): CommandBlock {
    return {
      type: CommandBlockTypes.Variable,
      startWith: 'xxx',
      endWith: CommandDirector.DIVIDER,
      value: '',
      variableValue: 0,
      digitsQuantity: 5,
      padText: '0',
      config: {
        type: CommandLineConfigTypes.Random,
        probabilityOfChange: 40,
        minRandom: 0,
        maxRandom: 999,
      },
    };
  }

  private phaseBlockSign(): CommandBlock {
    return {
      type: CommandBlockTypes.Variable,
      startWith: 'xxxx',
      value: '+',
      variableValue: '',
      digitsQuantity: 1,
      padText: '',
      config: {
        type: CommandLineConfigTypes.CharRandom,
        probabilityOfChange: 40,
        options: ['+', '-'],
      },
    };
  }

  private phaseBlock(): CommandBlock {
    return {
      type: CommandBlockTypes.Variable,
      endWith: CommandDirector.DIVIDER,
      value: '000',
      variableValue: 0,
      digitsQuantity: 3,
      padText: '0',
      config: {
        type: CommandLineConfigTypes.Random,
        probabilityOfChange: 40,
        minRandom: 0,
        maxRandom: 999,
      },
    };
  }
}
