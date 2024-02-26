import { ipcMain } from 'electron';

const essayTemplateCreateOrEdit = async (
  knex: any,
  essayTemplate: any,
  transaction: any
) => {
  const querybuilder = knex('essay_templates').transacting(transaction);
  const essayTemplateCopy = { ...essayTemplate };
  essayTemplateCopy.name = (essayTemplateCopy.name || '').toString().trim();
  if (essayTemplateCopy.id) {
    await querybuilder
      .update(essayTemplateCopy)
      .where('id', essayTemplateCopy.id);
  } else {
    const [newEssayTemplateId] = await querybuilder.insert(essayTemplateCopy);
    essayTemplateCopy.id = newEssayTemplateId;
  }
  return essayTemplateCopy;
};

const formatEssayTemplateSteps = (
  essayTemplateSteps: any,
  essayTemplateId: any
) =>
  essayTemplateSteps.map((essayTemplateStep: any, index: any) => ({
    ...essayTemplateStep,
    essay_template_id: essayTemplateId,
  }));

const essayTemplateStepsUpdateExisting = async (
  knex: any,
  essayTemplateSteps: any,
  transaction: any
) => {
  const essayTemplateStepsToUpdate = essayTemplateSteps.filter(
    ({ id }: any) => id
  );
  for await (const et of essayTemplateStepsToUpdate) {
    const {
      foreign,
      animationState,
      form_control_raw,
      ...remainingProperties
    } = et;
    const propertiesToUpdate = {
      ...remainingProperties,
      form_control_raw: JSON.stringify(form_control_raw),
    };
    await knex('essay_templates_steps')
      .transacting(transaction)
      .update(propertiesToUpdate)
      .where('id', et.id);
  }
  return essayTemplateStepsToUpdate;
};

const essayTemplateStepsCreateNews = async (
  knex: any,
  essayTemplateSteps: any,
  transaction: any
) => {
  const essayTemplateStepsToCreate = essayTemplateSteps.filter(
    ({ id }: any) => !id
  );
  for await (const et of essayTemplateStepsToCreate) {
    const {
      foreign,
      animationState,
      form_control_raw,
      ...remainingProperties
    } = et;
    const propertiesToInsert = {
      ...remainingProperties,
      form_control_raw: JSON.stringify(form_control_raw),
    };
    const [id] = await knex('essay_templates_steps')
      .transacting(transaction)
      .insert(propertiesToInsert);
    et.id = id;
  }
  return essayTemplateStepsToCreate;
};

const essayTemplateStepsDeleteOlds = async (
  knex: any,
  essayTemplateId: any,
  essayTemplateSteps: any,
  transaction: any
) => {
  const oldRelations = await knex('essay_templates_steps')
    .transacting(transaction)
    .select('id')
    .where('essay_template_id', essayTemplateId);
  const keepIds = essayTemplateSteps.map(({ id }: any) => id);
  const relationsToDelete = oldRelations
    .filter(({ id }: any) => !keepIds.includes(id))
    .map(({ id }: any) => id);
  if (relationsToDelete.length > 0) {
    await knex('essay_templates_steps')
      .transacting(transaction)
      .delete()
      .whereIn('id', relationsToDelete);
  }
};

export default {
  register: (knex: any) => {
    ipcMain.handle(
      'save-essay-template',
      async (_, { essayTemplate, essayTemplateSteps }) => {
        // open database transaction
        return await knex.transaction(async (transaction: any) => {
          essayTemplate = await essayTemplateCreateOrEdit(
            knex,
            essayTemplate,
            transaction
          );
          essayTemplateSteps = formatEssayTemplateSteps(
            essayTemplateSteps,
            essayTemplate.id
          );
          const essayTemplateStepsUpdated =
            await essayTemplateStepsUpdateExisting(
              knex,
              essayTemplateSteps,
              transaction
            );
          const essayTemplateStepsCreated = await essayTemplateStepsCreateNews(
            knex,
            essayTemplateSteps,
            transaction
          );
          essayTemplateSteps = [
            ...essayTemplateStepsUpdated,
            ...essayTemplateStepsCreated,
          ].sort((a, b) => a.order - b.order);
          await essayTemplateStepsDeleteOlds(
            knex,
            essayTemplate.id,
            essayTemplateSteps,
            transaction
          );
          return { essayTemplate, essayTemplateSteps };
        });
      }
    );
  },
};
