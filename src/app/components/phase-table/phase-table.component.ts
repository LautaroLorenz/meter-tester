import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Phase } from '../../models/business/interafces/phase.model';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-phase-table',
    templateUrl: './phase-table.component.html',
    styleUrls: ['./phase-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhaseTableComponent {
    @Input() showTexts!: boolean;
    @Input() phaseL1: Phase | Partial<Phase> | undefined;
    @Input() phaseL2: Phase | Partial<Phase> | undefined;
    @Input() phaseL3: Phase | Partial<Phase> | undefined;
    @Input() meterConstantEnum: MeterConstantEnum | undefined;

    getPowerFactorLabel(): string {
        if (this.meterConstantEnum === MeterConstantEnum.Active) {
            return 'Cos de phi';
        } else if (this.meterConstantEnum === MeterConstantEnum.Reactive) {
            return 'Sen de phi';
        }
        return 'Factor de potencia';
    }
}
