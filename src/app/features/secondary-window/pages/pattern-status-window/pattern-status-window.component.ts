import { Component } from '@angular/core';
import { SecondaryWindowComponent } from '../../models/secondary-window.model';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';

@Component({
    templateUrl: './pattern-status-window.component.html',
    styleUrls: ['./pattern-status-window.component.scss']
})
export class PatternStatusWindowComponent extends SecondaryWindowComponent {
    windowTitle = 'Patrón';
    patternStatus: PatternStatus | null = null;

    override onMainWindowMessage(patternStatus: PatternStatus): void {
        this.patternStatus = patternStatus;
    }
}
