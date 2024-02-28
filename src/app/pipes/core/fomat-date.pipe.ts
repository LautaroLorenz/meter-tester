import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

export enum FormatDateMode {
  fromClientToDatabase = 'fromClientToDatabase',
}

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  private datePipe = inject(DatePipe);

  transform(value: Date | string, mode: FormatDateMode): Date | string {
    switch (mode) {
      case FormatDateMode.fromClientToDatabase:
        if (typeof value !== 'object') {
          return '';
        }

        return this.datePipe.transform(
          value,
          'yyyy-MM-dd HH:mm:ss ZZZZ'
        ) as string;

      default:
        return '';
    }
  }
}
