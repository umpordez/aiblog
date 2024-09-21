import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TYPE avatar_input_status as ENUM (
            'waiting',
            'downloading',
            'downloaded',
            'transcribing',
            'transcribed',
            'creating',
            'done'
        );

        CREATE TABLE avatar_inputs (
            id uuid not null
                constraint pk_avatar_inputs
                primary key default(gen_random_uuid()),

            avatar_id uuid not null
                constraint fk_avatar_inputs_avatars
                references avatars(id),

            youtube_url text not null,
            status avatar_input_status not null
                constraint df_avatar_inputs_status
                default('waiting'),
            
            filepath text,
            transcription text,
            final_text text,

            utc_last_modified_on timestamp not null
                constraint df_avatar_inputs_utc_last_modified_on
                default (now()),

            utc_created_on timestamp not null
                constraint df_avatar_inputs_utc_created_on
                default (now())
        );
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE avatar_inputs;
        DROP TYPE avatar_input_status;
    `);
}

