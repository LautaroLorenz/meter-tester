import { Component } from '@angular/core';
import { SecondaryWindowComponent } from '../../models/secondary-window.model';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';
import { MeterConstantEnum } from '../../../../models/business/constants/meter-constant.model';

@Component({
    templateUrl: './pattern-status-window.component.html',
    styleUrls: ['./pattern-status-window.component.scss']
})
export class PatternStatusWindowComponent extends SecondaryWindowComponent {
    windowTitle = 'Patrón';
    patternStatus: PatternStatus | null = null;
    meterConstant: MeterConstantEnum | null = null;

    override onMainWindowMessage(
        data: { patternStatus: PatternStatus; meterConstant: MeterConstantEnum } | PatternStatus
    ): void {
        if ('patternStatus' in data) {
            this.patternStatus = data.patternStatus;
        }
        if ('meterConstant' in data) {
            this.meterConstant = data.meterConstant;
        }
    }
}
