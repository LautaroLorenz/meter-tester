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
    // TODO este comando se arma en base a la configuracion de commandStandsQuantiy
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
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|CAL|STW|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
        {
          type: CommandBlockTypes.Fixed,
          value: '|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
      ],
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
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|CAL|STW|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
        {
          type: CommandBlockTypes.Fixed,
          value: '|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
      ],
    },
    {
      name: CalculatorResponseCommands.RESULTS,
      config: {
        type: CommandLineConfigTypes.Incremental,
        probabilityOfChange: 25,
        incrementQuantity: 1,
      },
      enableConditions: [{ pattern: SoftwareCalculatorCommands.START_VACUUM }],
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|CAL|STW|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
        {
          type: CommandBlockTypes.Fixed,
          value: '|',
        },
        {
          type: CommandBlockTypes.Variable,
          value: '00000',
        },
      ],
    },
  ];
}
