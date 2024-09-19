import type { Knex } from "knex";

import Context from '../context.js';
import knex from '../knex.js';

class BaseModel {
    context: Context;
    knex: Knex;

    constructor(context: Context) {
        this.context = context;
        this.knex = knex;
    }
}

export default BaseModel;