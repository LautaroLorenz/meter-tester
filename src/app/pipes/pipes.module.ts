import { NgModule } from '@angular/core';
import {
  CommonModule,
  DecimalPipe,
  // DecimalPipe
} from '@angular/common';
import { DotStringAsObjectPipe } from './core/dot-string-as-object.pipe';
import { CastAbstractControlToFormGroupPipe } from './core/cast-abstract-control-to-form-group.pipe';
// import { ExecutionStatusPipe } from './execution-status.pipe';
// import { DeviceErrorCode } from './device-error-code.pipe';

const AppPipes = [
  DotStringAsObjectPipe,
  CastAbstractControlToFormGroupPipe,
  //   ExecutionStatusPipe,
  //   DeviceErrorCode,
];

const CommonPipes = [DecimalPipe];

@NgModule({
  declarations: [AppPipes],
  imports: [CommonModule],
  exports: [AppPipes, CommonPipes],
  providers: [AppPipes, CommonPipes],
})
export class PipesModule {}
