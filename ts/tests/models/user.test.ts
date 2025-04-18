import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper.js';

import User from '../../core/models/user.js';
import Context from '../../core/context.js';

import knex from '../../core/knex.js';

const userIds : string[] = [];

afterEach(async () => {
    while (userIds.length) {
        const userId = userIds.pop();
        await knex('users').where({ id: userId }).del();
    }
});

test('[ModelUser] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new User(ctx);

    assert(client);
});

test('[ModelUser] can create user', async () => {
    const ctx = new Context();
    const client = new User(ctx);
    const email = `spec17_${new Date().getTime()}`;

    const user = await client.create({
        name: 'Foo',
        email,
        password: 'bar'
    });

    assert(user);
    assert(user.id);
    assert(user.name === 'Foo');
    assert(user.email === email);

    userIds.push(user.id);
});

test('[ModelUser] get by id', async () => {
    const ctx = new Context();
    const client = new User(ctx);
    const email = `spec18_${new Date().getTime()}`;

    const user = await client.create({
        name: 'Foo',
        email,
        password: 'bar'
    });

    assert(user);
    assert(user.id);
    assert(user.name === 'Foo');
    assert(user.email === email);

    userIds.push(user.id);

    const dbUser = await client.getById(user.id);

    assert(dbUser);
    assert(dbUser.id === user.id);
});

test('[ModelUser] can create login', async () => {
    const ctx = new Context();
    const client = new User(ctx);
    const email = `spec18_${new Date().getTime()}`;

    const user = await client.create({
        name: 'Foo',
        email,
        password: 'bar'
    });

    assert(user);
    assert(user.id);
    assert(user.name === 'Foo');
    assert(user.email === email);

    userIds.push(user.id);

    try {
        await client.login(email, '123');
        throw new Error('Unexpected');
    } catch (ex) {
        if (ex instanceof Error) {
            assert(/Invalid password/.test(ex.message));
        } else {
            throw ex;
        }
    }

    try {
        await client.login('foodd', '123');
        throw new Error('Unexpected');
    } catch (ex) {
        if (ex instanceof Error) {
            assert(/User not found/.test(ex.message));
        } else {
            throw ex;
        }
    }

    await client.login(email, 'bar');
});