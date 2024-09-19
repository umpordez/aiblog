import knexModule from 'knex';
import knexConfig from '../knexfile.js';

const knex = knexModule(knexConfig);

export default knex;