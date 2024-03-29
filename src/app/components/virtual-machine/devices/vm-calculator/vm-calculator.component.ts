import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CalculatorResponseCommands } from '../../../../models/business/enums/commands.model';
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
  override readonly commandLines: CommandLine[] = [
    {
      name: CalculatorResponseCommands.ACK,
      blocks: [
        {
          type: CommandBlockTypes.Fixed,
          value: 'B|CAL|STW|ACK00000|Z|x',
        },
      ],
    },
    // TODO este comando se arma en base a la configuracion de stands
    {
      name: CalculatorResponseCommands.RESULTS,
      config: {
        type: CommandLineConfigTypes.Incremental,
        probabilityOfChange: 33,
        incrementQuantity: 1,
      },
      blocks: [
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
        probabilityOfChange: 33,
        minRandom: 2,
        maxRandom: 6,
      },
      blocks: [
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
