import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-phase-form-group',
    templateUrl: './phase-form-group.component.html',
    styleUrls: ['./phase-form-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhaseFormGroupComponent implements OnInit {
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
    @Input() isActiveFormControlName!: string;
    @Input() showCopyButton = false;
    @Input() meterConstantEnum: MeterConstantEnum | undefined;

    @Output() copyClick = new EventEmitter<void>();

    powerFactorLetterOptions = [
        { label: 'Seleccionar', value: '', disabled: true },
        { label: 'L', value: 'L' },
        { label: 'C', value: 'C' }
    ];

    ngOnInit(): void {
        // Initialize the disabled state based on the current isActive value
        this.initializeControlStates();
    }

    getPowerFactorLabel(): string {
        if (this.meterConstantEnum === MeterConstantEnum.Active) {
            return 'Cos de phi';
        } else if (this.meterConstantEnum === MeterConstantEnum.Reactive) {
            return 'Sen de phi';
        }
        return 'Factor de potencia';
    }

    onPhaseActiveChange(isActive: boolean): void {
        if (!isActive) {
            // Disable controls and reset all phase values to default when deactivated
            this.formGroup.get(this.voltageFormControlName)?.disable();
            this.formGroup.get(this.currentFormControlName)?.disable();
            this.formGroup.get(this.angleFormControlName)?.disable();
            this.formGroup.get(this.powerFactorFormControlName)?.disable();
            this.formGroup.get(this.powerFactorLetterFormControlName)?.disable();

            // Reset values
            this.formGroup.get(this.voltageFormControlName)?.setValue(0);
            this.formGroup.get(this.currentFormControlName)?.setValue(0);
            this.formGroup.get(this.angleFormControlName)?.setValue(0);
            this.formGroup.get(this.powerFactorFormControlName)?.setValue(0);
            this.formGroup.get(this.powerFactorLetterFormControlName)?.setValue('L');
        } else {
            // Enable controls and clear all phase values when activated
            this.formGroup.get(this.voltageFormControlName)?.enable();
            this.formGroup.get(this.currentFormControlName)?.enable();
            this.formGroup.get(this.angleFormControlName)?.enable();
            this.formGroup.get(this.powerFactorFormControlName)?.enable();
            this.formGroup.get(this.powerFactorLetterFormControlName)?.enable();

            // Clear values to encourage user input
            this.formGroup.get(this.voltageFormControlName)?.setValue(null);
            this.formGroup.get(this.currentFormControlName)?.setValue(null);
            this.formGroup.get(this.angleFormControlName)?.setValue(null);
            this.formGroup.get(this.powerFactorFormControlName)?.setValue(null);
            this.formGroup.get(this.powerFactorLetterFormControlName)?.setValue('');
        }
    }

    private initializeControlStates(): void {
        const isActive = this.formGroup.get(this.isActiveFormControlName)?.value;
        if (!isActive) {
            // Disable controls if phase is not active
            this.formGroup.get(this.voltageFormControlName)?.disable();
            this.formGroup.get(this.currentFormControlName)?.disable();
            this.formGroup.get(this.angleFormControlName)?.disable();
            this.formGroup.get(this.powerFactorFormControlName)?.disable();
            this.formGroup.get(this.powerFactorLetterFormControlName)?.disable();
        }
    }
}
