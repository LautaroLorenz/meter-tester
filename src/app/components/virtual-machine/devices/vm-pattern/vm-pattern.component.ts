import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import { PatternResponseCommands } from '../../../../models/business/enums/commands.model';

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
        // {
        //   type: CommandBlockTypes.Fixed,
        //   value: 'B|PAT|STW|',
        // },
        // {
        //   type: CommandBlockTypes.Variable,
        //   value: '0000000000',
        // },
        // xxxx2200| xxxx2200| xxxx2200| xxx00500| xxx00500| xxx00500| xxxx+000| xxxx+000| xxxx+000
      ],
    },
  ];
}
