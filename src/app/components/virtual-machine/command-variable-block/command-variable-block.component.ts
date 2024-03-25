import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import { CommandBlockComponent } from '../../../models/business/class/command-block.model';
import { CommandVariableBlockConfigType } from '../../../models/business/interafces/comand-variable-block.model';
import { CBVariableTypes } from '../../../models/business/enums/command-variable-block-config.model';
import { CBVariableTypesConstant } from '../../../models/business/constants/command-block.model';
import { Random } from '../../../models/core/random.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandsEnum } from '../../../models/business/enums/commands.model';

@Component({
  selector: 'app-command-variable-block',
  templateUrl: './command-variable-block.component.html',
  styleUrls: ['./command-variable-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CommandBlockComponent,
      useExisting: forwardRef(() => CommandVariableBlockComponent),
    },
  ],
})
export class CommandVariableBlockComponent
  extends CommandBlockComponent
  implements OnInit
{
  @Input() device!: Devices;
  @Input() command!: CommandsEnum;
  @Input() index!: string;
  @Input() value!: string;
  @Input() config!: CommandVariableBlockConfigType;

  variableValue!: string;
  configDialogOpen = false;
  blockID!: string;

  readonly CBVariableTypes = CBVariableTypes;
  readonly CBVariableTypesConstant = CBVariableTypesConstant;

  private digitsQuantity!: number;

  constructor(private readonly cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.blockID = `${this.device}-${this.command}-${this.index}`;
    this.digitsQuantity = this.value.length;
    this.variableValue = this.value;

    const savedConfig = localStorage.getItem(this.blockID);
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  changeConfig(): void {
    this.configDialogOpen = true;
    this.variableValue = this.value;
  }

  onDialoghide(): void {
    localStorage.setItem(this.blockID, JSON.stringify(this.config));
  }

  override refreshValue(): void {
    if (this.config.probabilityOfChange < Random.range(0, 100)) {
      return;
    }
    this.variableValue = this.getNewValue()
      .toString()
      .padStart(this.digitsQuantity, '0');
    this.cd.detectChanges();
  }

  override getCommandBlock(): string {
    return this.variableValue;
  }

  private getNewValue(): number {
    switch (this.config.type) {
      case CBVariableTypes.Incremental:
        return this.getIncremenetalValue(this.config.incrementQuantity);
      case CBVariableTypes.Random:
        return Random.range(this.config.minRandom, this.config.maxRandom);
    }
  }

  private getIncremenetalValue(incrementQuantity: number): number {
    const currentValue = Number(this.variableValue);
    return currentValue + incrementQuantity;
  }
}
