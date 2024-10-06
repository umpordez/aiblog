import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE avatar_inputs ADD COLUMN error_message text;
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE avatar_inputs DROP COLUMN error_message;
    `);
}

