import { ChangeDetectionStrategy, Component, forwardRef, OnInit } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CommandLine } from '../../../../models/business/interafces/command-line.model';
import { PatternResponseCommands } from '../../../../models/business/enums/commands.model';
import { CommandBlock, CommandBlockTypes } from '../../../../models/business/interafces/command-block.model';
import { CommandDirector } from '../../../../models/business/class/command-director.model';
import { CommandLineConfigTypes } from '../../../../models/business/interafces/command-block-config.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { PatternEnum } from '../../../../models/business/enums/pattern-enum.model';

@Component({
    selector: 'app-vm-pattern',
    templateUrl: './vm-pattern.component.html',
    styleUrls: ['./vm-pattern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: VMDeviceComponent,
            useExisting: forwardRef(() => VmPatternComponent)
        }
    ]
})
export class VmPatternComponent extends VMDeviceComponent implements OnInit {
    override readonly device = Devices.PAT;
    override commandLines: CommandLine[] = [];

    ngOnInit(): void {
        super.ngOnInit();

        if (APP_CONFIG.patternType === PatternEnum.Virtual || APP_CONFIG.patternType === PatternEnum.Physical) {
            this.commandLines.push({
                id: 1,
                name: PatternResponseCommands.CONSTANT,
                blocks: [
                    {
                        type: CommandBlockTypes.Fixed,
                        value: `B|${Devices.PAT}|${Devices.STW}|`
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
                            maxRandom: 9999999999
                        }
                    }
                ]
            });
        } else if (APP_CONFIG.patternType === PatternEnum.Sm5050) {
            const voltageRandom: CommandBlock = {
                type: CommandBlockTypes.Variable,
                endWith: CommandDirector.DIVIDER,
                value: '00000000',
                variableValue: null,
                digitsQuantity: 8,
                padText: '0',
                config: {
                    type: CommandLineConfigTypes.Random,
                    probabilityOfChange: 50,
                    minRandom: 0,
                    maxRandom: 5000
                }
            };
            const currentRandom: CommandBlock = {
                type: CommandBlockTypes.Variable,
                endWith: CommandDirector.DIVIDER,
                value: '00000000',
                variableValue: null,
                digitsQuantity: 8,
                padText: '0',
                config: {
                    type: CommandLineConfigTypes.Random,
                    probabilityOfChange: 50,
                    minRandom: 0,
                    maxRandom: 200000
                }
            };
            const angleRandom: CommandBlock[] = [
                {
                    type: CommandBlockTypes.Variable,
                    startWith: 'xxx',
                    value: '+',
                    variableValue: null,
                    digitsQuantity: 1,
                    padText: 'x',
                    config: {
                        type: CommandLineConfigTypes.CharRandom,
                        probabilityOfChange: 25,
                        options: ['-', '+']
                    }
                },
                {
                    type: CommandBlockTypes.Variable,
                    endWith: CommandDirector.DIVIDER,
                    value: '0000',
                    variableValue: null,
                    digitsQuantity: 4,
                    padText: '0',
                    config: {
                        type: CommandLineConfigTypes.Random,
                        probabilityOfChange: 50,
                        minRandom: 0,
                        maxRandom: 3500
                    }
                }
            ];
            this.commandLines.push({
                id: 1,
                name: PatternResponseCommands.CONSTANT,
                blocks: [
                    {
                        type: CommandBlockTypes.Fixed,
                        value: `B|${Devices.PAT}|${Devices.STW}|`
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
                            maxRandom: 9999999999
                        }
                    },
                    { ...voltageRandom },
                    { ...voltageRandom },
                    { ...voltageRandom },
                    { ...currentRandom },
                    { ...currentRandom },
                    { ...currentRandom },
                    { ...angleRandom[0] },
                    { ...angleRandom[1] },
                    { ...angleRandom[0] },
                    { ...angleRandom[1] },
                    { ...angleRandom[0] },
                    { ...angleRandom[1] }
                ]
            });
        }

        this.commandLines.forEach((commandLine) => this.refreshCommand(commandLine));
    }
}
