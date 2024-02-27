import { Pipe, PipeTransform } from '@angular/core';
import { pick } from 'dot-object';

@Pipe({
  name: 'dotStringAsObject',
})
export class DotStringAsObjectPipe implements PipeTransform {
  transform(value: object, path: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pick(path, value);
  }
}
