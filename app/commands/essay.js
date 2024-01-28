const { ipcMain } = require('electron');

let knex;

const essayTemplateCreateOrEdit = async (essayTemplate, transaction) => {
  const querybuilder = knex('essay_templates').transacting(transaction);
  const essayTemplateCopy = { ...essayTemplate };
  essayTemplateCopy.name = (essayTemplateCopy.name || '').toString().trim();
  if (essayTemplateCopy.id) {
    await querybuilder.update(essayTemplateCopy).where('id', essayTemplateCopy.id);
  } else {
    const [newEssayTemplateId] = await (querybuilder.insert(essayTemplateCopy));
    essayTemplateCopy.id = newEssayTemplateId;
  }
  return essayTemplateCopy;
}
const formatEssayTemplateSteps = (essayTemplateSteps, essayTemplateId) => essayTemplateSteps
  .map((essayTemplateStep, index) => ({
    ...essayTemplateStep,
    order: index + 1,
    essay_template_id: essayTemplateId,
  }));
const essayTemplateStepsUpdateExisting = async (essayTemplateSteps, transaction) => {
  const essayTemplateStepsToUpdate = essayTemplateSteps.filter(({ id }) => id);
  for await (const et of essayTemplateStepsToUpdate) {
    const { foreign, animationState, actions_raw_data, ...remainingProperties } = et;
    const propertiesToUpdate = {
      ...remainingProperties,
      actions_raw_data: JSON.stringify(actions_raw_data)
    };
    await knex('essay_templates_steps').transacting(transaction).update(propertiesToUpdate).where('id', et.id);
  }
  return essayTemplateStepsToUpdate;
}
const essayTemplateStepsCreateNews = async (essayTemplateSteps, transaction) => {
  const essayTemplateStepsToCreate = essayTemplateSteps.filter(({ id }) => !id);
  for await (const et of essayTemplateStepsToCreate) {
    const { foreign, animationState, actions_raw_data, ...remainingProperties } = et;
    const propertiesToInsert = {
      ...remainingProperties,
      actions_raw_data: JSON.stringify(actions_raw_data)
    };
    const [id] = await knex('essay_templates_steps').transacting(transaction).insert(propertiesToInsert);
    et.id = id;
  }
  return essayTemplateStepsToCreate;
}
const essayTemplateStepsDeleteOlds = async (essayTemplateId, essayTemplateSteps, transaction) => {
  const oldRelations = await knex('essay_templates_steps').transacting(transaction).select('id').where('essay_template_id', essayTemplateId);
  const keepIds = essayTemplateSteps.map(({ id }) => id);
  const relationsToDelete = oldRelations.filter(({ id }) => !keepIds.includes(id)).map(({ id }) => id);
  if (relationsToDelete.length > 0) {
    await knex('essay_templates_steps').transacting(transaction).delete().whereIn('id', relationsToDelete);
  }
}

ipcMain.handle('save-essay-template', async (_, { essayTemplate, essayTemplateSteps }) => {
  // open database transaction
  return await knex.transaction(async (transaction) => {
    essayTemplate = await essayTemplateCreateOrEdit(essayTemplate, transaction);
    essayTemplateSteps = formatEssayTemplateSteps(essayTemplateSteps, essayTemplate.id);
    const essayTemplateStepsUpdated = await essayTemplateStepsUpdateExisting(essayTemplateSteps, transaction);
    const essayTemplateStepsCreated = await essayTemplateStepsCreateNews(essayTemplateSteps, transaction);
    essayTemplateSteps = [...essayTemplateStepsUpdated, ...essayTemplateStepsCreated].sort((a, b) => a.order - b.order);
    await essayTemplateStepsDeleteOlds(essayTemplate.id, essayTemplateSteps, transaction);
    return { essayTemplate, essayTemplateSteps };
  });
});

module.exports = {
  setKnex: (args) => knex = args,
}
