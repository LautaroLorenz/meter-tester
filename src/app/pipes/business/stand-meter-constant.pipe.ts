import { Pipe, PipeTransform } from '@angular/core';
import { MeterConstantEnum, MeterConstants } from '../../models/business/constants/meter-constant.model';
import { Meter } from '../../models/business/database/meter.model';

/**
 * @return MeterConstantEnum como 'value[unit]'
 */
@Pipe({
    name: 'standMeterConstant'
})
export class StandMeterConstantPipe implements PipeTransform {
    readonly MeterConstants = MeterConstants;

    transform(
        stepMeterConstant: MeterConstantEnum,
        standMeter: Meter | undefined | null,
        returnType: 'OnlyValue' | 'OnlyUnit' | 'ValueAndUnit' = 'ValueAndUnit'
    ): string {
        // Handle null or undefined meter
        if (!standMeter) {
            return '';
        }

        let constantValue: number;
        let constantUnit = '';
        switch (stepMeterConstant) {
            case MeterConstantEnum.Active:
                constantValue = standMeter.activeConstantValue;
                constantUnit = standMeter.foreign?.activeConstantUnit?.name || '';
                break;
            case MeterConstantEnum.Reactive:
                constantValue = standMeter.reactiveConstantValue;
                constantUnit = standMeter.foreign?.reactiveConstantUnit?.name || '';
                break;
        }

        switch (returnType) {
            case 'OnlyValue':
                return constantValue.toString();
            case 'OnlyUnit':
                return constantUnit;
            case 'ValueAndUnit':
                return `${constantValue} [${constantUnit}]`;
        }
    }
}
