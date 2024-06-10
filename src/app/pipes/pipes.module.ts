import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { DotStringAsObjectPipe } from './core/dot-string-as-object.pipe';
import { CastAbstractControlToFormGroupPipe } from './core/cast-abstract-control-to-form-group.pipe';
import { FormatDatePipe } from './core/fomat-date.pipe';
import { MeterConstantPipe } from './business/meter-constant.pipe';
import { DeviceConstantPipe } from './business/device.pipe';
import { StandMeterConstantPipe } from './business/stand-meter-constant.pipe';
import { StepAsPipe } from './business/step-as.pipe';
import { EnumAsOptionPipe } from './core/enum-as-option.pipe';
import { TranslateEnumPipe } from './core/translate-enum.pipe';

const AppPipes = [
    DotStringAsObjectPipe,
    CastAbstractControlToFormGroupPipe,
    FormatDatePipe,
    MeterConstantPipe,
    DeviceConstantPipe,
    StandMeterConstantPipe,
    StepAsPipe,
    EnumAsOptionPipe,
    TranslateEnumPipe
];

const CommonPipes = [DecimalPipe, DatePipe];

@NgModule({
    declarations: [AppPipes],
    imports: [CommonModule],
    exports: [AppPipes, CommonPipes],
    providers: [AppPipes, CommonPipes]
})
export class PipesModule {}
