import knexfile from './knexfile';
import abm from '../../commands/abm';
// const { setKnex: setEssayKnex } = require('../commands/essay');

let knex;

export default {
  connect: ({ isProduction }: Record<string, boolean>) => {
    const environment = isProduction ? 'production' : 'development';

    knexfile.setIsProduction(isProduction);
    knex = require('knex')(knexfile[environment]);

    abm.setKnex(knex);
    // setEssayKnex(knex);
  },
};
