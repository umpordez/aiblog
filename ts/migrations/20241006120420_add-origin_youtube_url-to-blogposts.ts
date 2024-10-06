import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE blog_posts ADD COLUMN origin_youtube_url text;
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE blog_posts DROP COLUMN origin_youtube_url;
    `);
}

