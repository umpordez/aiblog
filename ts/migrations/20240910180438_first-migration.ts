import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TYPE user_in_account_role AS ENUM ('admin');

        CREATE TABLE users (
            id uuid not null
                constraint pk_users
                primary key default(gen_random_uuid()),

            email text not null
                constraint uq_users_email unique,

            name text not null,
            password text,

            utc_created_on timestamp not null
                constraint df_users_utc_created_on
                default (now())
        );

        CREATE TABLE accounts (
            id uuid not null
                constraint pk_accounts
                primary key default(gen_random_uuid()),

            title text not null,

            utc_created_on timestamp not null
                constraint df_accounts_utc_created_on
                default (now())
        );

        CREATE TABLE avatars (
            id uuid not null
                constraint pk_avatar
                primary key default(gen_random_uuid()),

            account_id uuid not null
                constraint fk_avatars_accounts
                references accounts(id),

            name text not null,
            description text not null,

            utc_created_on timestamp not null
                constraint df_avatars_utc_created_on
                default (now())
        );

        CREATE TABLE user_in_accounts (
            user_id uuid not null
                constraint fk_user_in_accounts_users
                references users(id),

            account_id uuid not null
                constraint fk_user_in_accounts_accounts
                references accounts(id),

            role user_in_account_role not null,

            constraint pk_user_in_accounts primary key (user_id, account_id)
        );

        CREATE TABLE blog_posts (
            id uuid not null
                constraint pk_blog_post
                primary key default(gen_random_uuid()),

            account_id uuid not null
                constraint fk_blog_posts_accounts
                references accounts(id),

            name text not null,
            description text not null,

            utc_created_on timestamp not null
                constraint df_blog_posts_utc_created_on
                default (now())
        );
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE blog_posts;
        DROP TABLE user_in_accounts;
        DROP TABLE accounts;
        DROP TABLE users;
        DROP TYPE user_in_account_role;
    `);
}

