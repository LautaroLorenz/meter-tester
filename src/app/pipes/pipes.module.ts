import { NgModule } from '@angular/core';
import {
  CommonModule,
  // DecimalPipe
} from '@angular/common';
import { DotStringAsObjectPipe } from './dot-string-as-object.pipe';
// import { ExecutionStatusPipe } from './execution-status.pipe';
// import { DeviceErrorCode } from './device-error-code.pipe';

const Pipes = [
  DotStringAsObjectPipe,
  //   ExecutionStatusPipe,
  //   DeviceErrorCode,
];

@NgModule({
  declarations: [Pipes],
  imports: [CommonModule],
  exports: [Pipes],
  providers: [Pipes],
})
export class PipesModule {}
