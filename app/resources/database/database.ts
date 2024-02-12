import knexfile from './knexfile';

let knex: any;

export default {
  connect: ({ isProduction }: Record<string, boolean>) => {
    const environment = isProduction ? 'production' : 'development';
    knex = require('knex')(knexfile[environment]);
    return knex;
  },
};
