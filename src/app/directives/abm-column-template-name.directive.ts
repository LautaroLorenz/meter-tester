import { Directive, Input, TemplateRef } from '@angular/core';
import { TableColumnTemplateContext } from '../models/core/table-column.model';

@Directive({
    selector: '[abmColumnTemplateName]'
})
export class AbmColumnTemplateNameDirective {
    @Input() abmColumnTemplateName!: string;

    constructor(public templateRef: TemplateRef<TableColumnTemplateContext<any>>) {}
}
