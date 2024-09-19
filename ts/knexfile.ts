import type { Knex } from "knex";

import dotenv from "dotenv";
import path from 'node:path';
import dirname from "./dirname.js";

dotenv.config({ path: path.resolve(dirname, '.env') });

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