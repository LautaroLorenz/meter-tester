import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import {
  CalculatorResponseCommands,
  SoftwareCalculatorCommands,
} from '../../../../models/business/enums/commands.model';
import {
  CommandLine,
  CommandLineConfigTypes,
} from '../../../../models/business/interafces/command-line.model';
import { CommandBlockTypes } from '../../../../models/business/enums/command-block-types.model';
import { CommandBlock } from '../../../../models/business/interafces/command-block.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { CommandDirector } from '../../../../models/business/class/command-director.model';

@Component({
  selector: 'app-vm-calculator',
  templateUrl: './vm-calculator.component.html',
  styleUrls: ['./vm-calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: VMDeviceComponent,
      useExisting: forwardRef(() => VmCalculatorComponent),
    },
  ],
})
export class VmCalculatorComponent extends VMDeviceComponent {
  override readonly device = Devices.CAL;
  override commandLines: CommandLine[] = [
    {
      name: CalculatorResponseCommands.ACK,
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|CAL|STW|ACK00000|Z|x',
        },
      ],
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      config: {
        type: CommandLineConfigTypes.Incremental,
        probabilityOfChange: 100,
        incrementQuantity: 1,
      },
      enableConditions: [
        { pattern: SoftwareCalculatorCommands.START_CONTRAST },
      ],
      blocks: this.generateResultCommandBlocks(),
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      config: {
        type: CommandLineConfigTypes.Random,
        probabilityOfChange: 100,
        minRandom: 2,
        maxRandom: 6,
      },
      enableConditions: [{ pattern: SoftwareCalculatorCommands.START_BOOT }],
      blocks: this.generateResultCommandBlocks(),
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      config: {
        type: CommandLineConfigTypes.Incremental,
        probabilityOfChange: 25,
        incrementQuantity: 1,
      },
      enableConditions: [{ pattern: SoftwareCalculatorCommands.START_VACUUM }],
      blocks: this.generateResultCommandBlocks(),
    },
  ];

  private generateResultCommandBlocks(): CommandBlock[] {
    const standResult: CommandBlock[] = Array(APP_CONFIG.commandStandsQuantity)
      .fill('')
      .map((_, index) => [
        {
          type: CommandBlockTypes.Fixed,
          value: `PS${(index + 1).toString().padStart(2, '0')}`,
        },
        {
          type: CommandBlockTypes.Variable,
          value: `00000`,
        },
        {
          type: CommandBlockTypes.Fixed,
          value: CommandDirector.DIVIDER,
        },
      ])
      .reduce((acc, value) => (acc = acc.concat(value)), []);

    return [
      {
        type: CommandBlockTypes.Fixed,
        value: 'B|CAL|STW|',
      },
      ...standResult,
    ];
  }
}
