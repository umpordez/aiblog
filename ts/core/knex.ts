import knexModule from 'knex';
import knexConfig from '../knexfile';

const knex = knexModule(knexConfig);

export default knex;