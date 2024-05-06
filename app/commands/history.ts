import { ipcMain } from 'electron';

const historyEssayCreateOrEdit = async (
  knex: any,
  history_essay: any,
  transaction: any
) => {
  const querybuilder = knex('history_essay').transacting(transaction);
  const historyEssayCopy = { ...history_essay };
  if (historyEssayCopy.id) {
    await querybuilder
      .update(historyEssayCopy)
      .where('id', historyEssayCopy.id);
  } else {
    const [newHistoryEssayId] = await querybuilder.insert(historyEssayCopy);
    historyEssayCopy.id = newHistoryEssayId;
  }
  return historyEssayCopy;
};

const formatHistoryEssayRows = (historyEssayRows: any, historyEssayId: any) =>
  historyEssayRows.map((historyEssayRow: any, index: any) => ({
    ...historyEssayRow,
    history_essay_id: historyEssayId,
  }));

const createNews = async (
  knex: any,
  rows: any,
  transaction: any,
  tableName: string
) => {
  const createdRows = rows.filter(({ id }: any) => !id);
  for await (const et of createdRows) {
    const {
      foreign,
      animationState,
      form_control_raw,
      ...remainingProperties
    } = et;
    const propertiesToInsert = { ...remainingProperties };
    if (!!form_control_raw) {
      propertiesToInsert.form_control_raw = JSON.stringify(form_control_raw);
    }
    const [id] = await knex(tableName)
      .transacting(transaction)
      .insert(propertiesToInsert);
    et.id = id;
  }
  return createdRows;
};

export default {
  register: (knex: any) => {
    ipcMain.handle(
      'save-history-essay',
      async (_, { historyEssay, historyEssayRows }) => {
        // open database transaction
        return await knex.transaction(async (transaction: any) => {
          historyEssay = await historyEssayCreateOrEdit(
            knex,
            historyEssay,
            transaction
          );
          historyEssayRows = formatHistoryEssayRows(
            historyEssayRows,
            historyEssay.id
          );
          const rowsCreated = await createNews(
            knex,
            historyEssayRows,
            transaction,
            'history_essay_step_stand'
          );
          return { historyEssay, historyEssayRows: rowsCreated };
        });
      }
    );
  },
};
