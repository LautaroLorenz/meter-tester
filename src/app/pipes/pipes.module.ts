import { NgModule } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { DotStringAsObjectPipe } from './core/dot-string-as-object.pipe';
import { CastAbstractControlToFormGroupPipe } from './core/cast-abstract-control-to-form-group.pipe';
import { FormatDatePipe } from './core/fomat-date.pipe';
// import { ExecutionStatusPipe } from './execution-status.pipe';
// import { DeviceErrorCode } from './device-error-code.pipe';

const AppPipes = [
  DotStringAsObjectPipe,
  CastAbstractControlToFormGroupPipe,
  FormatDatePipe,
  //   ExecutionStatusPipe,
  //   DeviceErrorCode,
];

const CommonPipes = [DecimalPipe, DatePipe];

@NgModule({
  declarations: [AppPipes],
  imports: [CommonModule],
  exports: [AppPipes, CommonPipes],
  providers: [AppPipes, CommonPipes],
})
export class PipesModule {}
