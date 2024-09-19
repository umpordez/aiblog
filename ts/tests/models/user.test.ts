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

    const user = await client.create({
        name: 'Foo',
        email: 'foo',
        password: 'bar'
    });

    assert(user);
    assert(user.id);
    assert(user.name === 'Foo');
    assert(user.email === 'foo');

    userIds.push(user.id);
});