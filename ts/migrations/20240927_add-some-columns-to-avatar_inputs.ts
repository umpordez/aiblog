import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE avatar_inputs ADD COLUMN final_title text;
        ALTER TABLE avatar_inputs ADD COLUMN final_short_description text;

        ALTER TABLE blog_posts ADD COLUMN image_url text;
        ALTER TABLE blog_posts ADD COLUMN short_description text;
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE avatar_inputs DROP COLUMN final_title;
        ALTER TABLE avatar_inputs DROP COLUMN final_short_description;

        ALTER TABLE blog_posts DROP COLUMN image_url;
        ALTER TABLE blog_posts DROP COLUMN short_description;
    `);
}
