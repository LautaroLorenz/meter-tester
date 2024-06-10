import { DbForeignKey, DbTableContext } from '../../core/database.model';
import { Steps } from '../enums/steps.model';
import { EssayTemplate, EssayTemplateDbTableContext } from './essay-template.model';
import { Step, StepDbTableContext } from './step.model';

export interface EssayTemplateStep extends DbForeignKey {
    id: number;
    order: number;
    essay_template_id: number;
    step_id: Steps;
    form_control_raw: any;
    foreign: {
        essayTemplate?: EssayTemplate;
        step?: Step;
    };
}

export const EssayTemplateStepDbTableContext: DbTableContext = {
    tableName: 'essay_templates_steps',
    rawProperties: ['form_control_raw'],
    foreignTables: [
        {
            tableName: EssayTemplateDbTableContext.tableName,
            foreignKey: 'essay_template_id',
            propertyName: 'essayTemplate'
        },
        {
            tableName: StepDbTableContext.tableName,
            foreignKey: 'step_id',
            propertyName: 'step'
        }
    ]
};
