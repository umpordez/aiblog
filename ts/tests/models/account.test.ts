
import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper.js';

import Account from '../../core/models/account.js';
import Context from '../../core/context.js';

import knex from '../../core/knex.js';

const userIds : string[] = [];
const accountIds : string[] = [];

afterEach(async () => {
    while (accountIds.length) {
        const accountId = accountIds.pop();

        await knex('user_in_accounts').where({ account_id: accountId }).del();
        await knex('avatars').where({ account_id: accountId }).del();
        await knex('accounts').where({ id: accountId }).del();
    }

    while (userIds.length) {
        const userId = userIds.pop();

        await knex('user_in_accounts').where({ user_id: userId }).del();
        await knex('users').where({ id: userId }).del();
    }
});

test('[ModelAccount] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new Account(ctx);

    assert(client);
});

test('[ModelAccount] can create account', async () => {
    const ctx = new Context();
    const client = new Account(ctx);
    const link = `spec1_${new Date().getTime()}`;

    const account = await client.create({
        title: 'Foo',
        link
    });

    assert(account);
    assert(account.id);
    assert(account.title === 'Foo');
    assert(account.link === link);

    accountIds.push(account.id);
});

test('[ModelAccount] can create account, create user and associate', async () => {
    const ctx = new Context();
    const email = `spec2_${new Date().getTime()}`;
    const link = `spec2_${new Date().getTime()}`;

    const user = await ctx.user.create({
        name: 'Foo',
        email,
        password: 'bar'
    });

    userIds.push(user.id);

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);
    await ctx.account.addUser(account.id, user.id, 'admin');

    const userInAccount = await knex('user_in_accounts').where({
        user_id: user.id,
        account_id: account.id
    }).first();

    assert(userInAccount);
    assert(userInAccount.role === 'admin');
});

test('[ModelAccount] getAllByUserId', async () => {
    const ctx = new Context();
    const email = `spec3_${new Date().getTime()}`;
    const link = `spec3_${new Date().getTime()}`;

    const user = await ctx.user.create({
        email,
        name: 'Foo',
        password: 'bar'
    });

    userIds.push(user.id);

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);
    await ctx.account.addUser(account.id, user.id, 'admin');

    const accounts = await ctx.account.getAllByUser(user.id);

    assert(accounts);
    assert(accounts.length === 1);
    assert(accounts[0].id === account.id);
});

test('[ModelAccount] demandUserAccess', async () => {
    const ctx = new Context();
    const email = `spec4_${new Date().getTime()}`;
    const link = `spec4_${new Date().getTime()}`;

    const user = await ctx.user.create({
        name: 'Foo',
        email,
        password: 'bar'
    });

    userIds.push(user.id);

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    try {
        await ctx.account.demandUserAccess(account.id, user.id);
        throw new Error('Unexpected');
    } catch (ex) {
        if (ex instanceof Error) {
            assert(/has no access to/.test(ex.message));
        } else {
            throw ex;
        }
    }

    await ctx.account.addUser(account.id, user.id, 'admin');
    await ctx.account.demandUserAccess(account.id, user.id);
});


test('[ModelAccount] getById', async () => {
    const ctx = new Context();
    const email = `spec5_${new Date().getTime()}`;
    const link = `spec5_${new Date().getTime()}`;

    const user = await ctx.user.create({
        email,
        name: 'Foo',
        password: 'bar'
    });

    userIds.push(user.id);

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const dbAccount = await ctx.account.getById(account.id);

    assert.strictEqual(account.id, dbAccount.id);
    assert.strictEqual(account.title, dbAccount.title);
    assert.strictEqual(account.link, dbAccount.link);
});