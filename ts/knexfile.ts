import type { Knex } from "knex";

import { fileURLToPath } from 'url';

import dotenv from "dotenv";
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.PSQL_HOST,
        database: process.env.PSQL_DATABASE,
        user: process.env.PSQL_USER,
        password: process.env.PSQL_PASSWORD
    }
};

export default config;
