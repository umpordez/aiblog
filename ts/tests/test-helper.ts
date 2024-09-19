import dotenv from "dotenv";

import { after } from "node:test";

import path from 'node:path';

import knex from '../core/knex.js';
import dirname from '../dirname.js';

dotenv.config({ path: path.resolve(dirname, '../.env') });

after(async () => {
    await knex.destroy();
});