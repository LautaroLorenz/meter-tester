import { ipcMain } from 'electron';

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
    ipcMain.handle('save-history-essay', async (_, { historyEssayRows }) => {
      // open database transaction
      return await knex.transaction(async (transaction: any) => {
        const rowsCreated = await createNews(
          knex,
          historyEssayRows,
          transaction,
          'history_essay'
        );
        return { rowsCreated };
      });
    });
  },
};
