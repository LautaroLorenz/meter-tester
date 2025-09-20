import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-phase-form-group',
    templateUrl: './phase-form-group.component.html',
    styleUrls: ['./phase-form-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhaseFormGroupComponent {
    @Input() formGroup!: FormGroup;
    @Input() faseLabel!: string;
    @Input() voltageFormControlName!: string;
    @Input() voltageLabel!: string;
    @Input() currentFormControlName!: string;
    @Input() currentLabel!: string;
    @Input() angleFormControlName!: string;
    @Input() angleLabel!: string;
    @Input() powerFactorFormControlName!: string;
    @Input() powerFactorLabel!: string;
    @Input() powerFactorLetterFormControlName!: string;
    @Input() powerFactorLetterLabel!: string;
    @Input() showCopyButton = false;
    @Input() meterConstantEnum: MeterConstantEnum | undefined;

    @Output() copyClick = new EventEmitter<void>();

    powerFactorLetterOptions = [
        { label: 'L', value: 'L' },
        { label: 'C', value: 'C' }
    ];

    getPowerFactorLabel(): string {
        if (this.meterConstantEnum === MeterConstantEnum.Active) {
            return 'Cos de phi';
        } else if (this.meterConstantEnum === MeterConstantEnum.Reactive) {
            return 'Sen de phi';
        }
        return 'Factor de potencia';
    }
}
