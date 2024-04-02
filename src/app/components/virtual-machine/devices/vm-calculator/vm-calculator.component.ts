import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import {
  CalculatorResponseCommands,
  SoftwareCalculatorCommands,
} from '../../../../models/business/enums/commands.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import {
  CommandBlock,
  CommandBlockTypes,
} from '../../../../models/business/interafces/command-block.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { CommandDirector } from '../../../../models/business/class/command-director.model';
import { CommandLineConfigTypes } from '../../../../models/business/interafces/command-block-config.model';

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
      enableConditions: [
        { pattern: SoftwareCalculatorCommands.START_CONTRAST },
      ],
      blocks: this.generateResultCommandBlocks(),
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      enableConditions: [{ pattern: SoftwareCalculatorCommands.START_BOOT }],
      blocks: this.generateResultCommandBlocks(),
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      enableConditions: [{ pattern: SoftwareCalculatorCommands.START_VACUUM }],
      blocks: this.generateResultCommandBlocks(),
    },
  ];

  private generateResultCommandBlocks(): CommandBlock[] {
    const standResult: CommandBlock[] = Array(APP_CONFIG.commandStandsQuantity)
      .fill('')
      .map<CommandBlock[]>((_, index) => [
        {
          type: CommandBlockTypes.Variable,
          startWith: `PS${(index + 1).toString().padStart(2, '0')}`,
          endWith: CommandDirector.DIVIDER,
          value: '',
          numberValue: 0,
          digitsQuantity: 5,
          padText: '0',
          config: {
            type: CommandLineConfigTypes.Incremental,
            incrementQuantity: 1,
            probabilityOfChange: 40,
          },
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
