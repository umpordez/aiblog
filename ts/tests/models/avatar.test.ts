
import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper';

import Avatar from '../../models/avatar';
import Context from '../../core/context';

import knex from '../../core/knex';

const accountIds : string[] = [];

afterEach(async () => {
    while (accountIds.length) {
        const accountId = accountIds.pop();

        await knex('user_in_accounts').where({ account_id: accountId }).del();
        await knex('avatars').where({ account_id: accountId }).del();
        await knex('accounts').where({ id: accountId }).del();
    }
});

test('[ModelAvatar] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new Avatar(ctx);

    assert(client);
});

test('[ModelAvatar] can create avatar', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);

    const account = await ctx.account.create({
        title: 'Foo',
        link: 'foo'
    });

    assert(account);
    assert(account.id);
    assert(account.title === 'Foo');
    assert(account.link === 'foo');

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', description: 'Bar' }
    );

    assert(avatar);
    assert(avatar.id);
});