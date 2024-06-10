import { Pipe, PipeTransform } from '@angular/core';
import { EssayTemplateStep } from '../../models/business/database/essay-template-step.model';

@Pipe({
    name: 'stepAs'
})
export class StepAsPipe implements PipeTransform {
    transform<T>(step: EssayTemplateStep): T {
        return step as T;
    }
}
