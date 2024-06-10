import { Pipe, PipeTransform, inject } from '@angular/core';
import { EnumAsOption } from '../../models/core/enum-as-option.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'enumAsOption'
})
export class EnumAsOptionPipe implements PipeTransform {
    translate = inject(TranslateService);

    transform(enumName: string, keys: Record<string, string>): EnumAsOption[] {
        return Object.keys(keys).map<EnumAsOption>((key) => ({
            label: this.translate.instant(`${enumName}.${key}`) as string,
            value: keys[key]
        }));
    }
}
