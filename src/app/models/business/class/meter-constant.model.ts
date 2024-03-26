import { MeterConstantEnum } from '../constants/meter-constant.model';
import { Meter } from '../database/meter.model';

export class MeterConstantDirector {
  static get(meter: Meter, stepMeterConstant: MeterConstantEnum): number {
    switch (stepMeterConstant) {
      case MeterConstantEnum.Active:
        return meter.activeConstantValue;
      case MeterConstantEnum.Reactive:
        return meter.reactiveConstantValue;
    }
  }
}
