import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import { after } from "node:test";

import path from 'node:path';
import knex from '../core/knex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

after(async () => {
    await knex.destroy();
});