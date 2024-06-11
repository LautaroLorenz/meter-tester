import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'translateEnum'
})
export class TranslateEnumPipe implements PipeTransform {
    private translate = inject(TranslateService);

    transform(enumKey: string, enumName: string): string {
        return this.translate.instant(`${enumName}.${enumKey}`) as string;
    }
}
