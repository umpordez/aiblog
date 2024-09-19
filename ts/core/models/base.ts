import type { Knex } from "knex";

import Context from '../context';
import knex from '../knex';

class BaseModel {
    context: Context;
    knex: Knex;

    constructor(context: Context) {
        this.context = context;
        this.knex = knex;
    }
}

export default BaseModel;