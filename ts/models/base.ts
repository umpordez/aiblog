import type { Knex } from "knex";

import Context from '../core/context';
import knex from '../core/knex';

class BaseModel {
    context: Context;
    knex: Knex;

    constructor(context: Context) {
        this.context = context;
        this.knex = knex;
    }
}

export default BaseModel;