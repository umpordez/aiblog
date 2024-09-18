
import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper';

import User from '../../models/user';
import Context from '../../core/context';

import knex from '../../core/knex';

const userIds : string[] = [];

afterEach(async () => {
    while (userIds.length) {
        const userId = userIds.pop();
        await knex('users').where({ id: userId }).del();
    }
});

test('[User] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new User(ctx);

    assert(client);
});

test('[User] can create user', async () => {
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