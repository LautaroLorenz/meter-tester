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
    ...this.stopCommands(APP_CONFIG.standsQuantiy),
    ...this.ts01Commands(APP_CONFIG.standsQuantiy),
    ...this.ts02Commands(APP_CONFIG.standsQuantiy),
  ];

  private stopCommands(standsQuantiy: number): CommandLine[] {
    return Array(standsQuantiy)
      .fill('')
      .map((_, index) => {
        const standNumber = (index + 1).toString().padStart(2, '0');
        return {
          id: index + 1,
          name: CalculatorResponseCommands.ACK,
          enableConditions: [{ pattern: `P${standNumber}|STOP` }],
          blocks: [
            {
              type: CommandBlockTypes.Fixed,
              value: `B|${Devices.CAL}|${Devices.STW}|P${standNumber}|ACK00000|Z|x`,
            },
          ],
        };
      });
  }

  private ts01Commands(standsQuantiy: number): CommandLine[] {
    return Array(standsQuantiy)
      .fill('')
      .map((_, index) => {
        const standNumber = (index + 1).toString().padStart(2, '0');
        return {
          id: 10 + index + 1,
          name: CalculatorResponseCommands.ACK,
          enableConditions: [
            {
              pattern: `P${standNumber}|${SoftwareCalculatorCommands.RESULT_TS01}`,
            },
          ],
          blocks: [
            {
              type: CommandBlockTypes.Fixed,
              value: `B|${Devices.CAL}|${Devices.STW}|P${standNumber}|ACK`,
            },
            {
              type: CommandBlockTypes.Variable,
              value: ' ',
              variableValue: null,
              digitsQuantity: 1,
              padText: '',
              config: {
                type: CommandLineConfigTypes.CharRandom,
                probabilityOfChange: 5,
                options: [' ', '-'],
              },
            },
            {
              type: CommandBlockTypes.Variable,
              value: '0000',
              variableValue: null,
              digitsQuantity: 4,
              padText: '0',
              config: {
                type: CommandLineConfigTypes.Random,
                probabilityOfChange: 50,
                maxRandom: 3099,
                minRandom: 0,
              },
              endWith: `${CommandDirector.DIVIDER}Z${CommandDirector.DIVIDER}x`,
            },
          ],
        };
      });
  }

  private ts02Commands(standsQuantiy: number): CommandLine[] {
    return Array(standsQuantiy)
      .fill('')
      .map((_, index) => {
        const standNumber = (index + 1).toString().padStart(2, '0');
        return {
          id: 20 + index + 1,
          name: CalculatorResponseCommands.ACK,
          enableConditions: [
            {
              pattern: `P${standNumber}|${SoftwareCalculatorCommands.RESULT_TS02}`,
            },
          ],
          blocks: [
            {
              type: CommandBlockTypes.Fixed,
              value: `B|${Devices.CAL}|${Devices.STW}|P${standNumber}|ACK`,
            },
            {
              type: CommandBlockTypes.Variable,
              value: '00000',
              variableValue: null,
              digitsQuantity: 5,
              padText: '0',
              config: {
                type: CommandLineConfigTypes.Incremental,
                probabilityOfChange: 30,
                incrementQuantity: 1,
              },
              endWith: `${CommandDirector.DIVIDER}Z${CommandDirector.DIVIDER}x`,
            },
          ],
        };
      });
  }
}
