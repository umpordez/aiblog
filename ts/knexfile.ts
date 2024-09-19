import type { Knex } from "knex";

import dotenv from "dotenv";
import path from 'node:path';
import { __filename } from "__filename";

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