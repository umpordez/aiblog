import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper.js';

import Avatar from '../../core/models/avatar.js';
import Context from '../../core/context.js';

import knex from '../../core/knex.js';

const accountIds : string[] = [];
const avatarIds : string[] = [];

afterEach(async () => {
    while(avatarIds.length) {
        const avatarId = avatarIds.pop();
        await knex('avatar_inputs').where({ avatar_id: avatarId }).del();
    }

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

test('[ModelAvatar] can createInput', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    assert(account);
    assert(account.id);
    assert(account.title === 'Foo');
    assert(account.link === link);

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    assert(avatar);
    assert(avatar.id);
});

test('[ModelAvatar] can create avatar input', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    assert(input);
    assert(input.id);
    assert(input.youtube_url);
    assert(input.status === 'waiting');
});

test('[ModelAvatar] can get avatar input status', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    let status = await ctx.avatar
        .getInputStatus(account.id, input.id);

    assert(status);
    assert(status.isRunning === false);
    assert(status.isDone === false);

    await knex('avatar_inputs')
        .update({ status: 'downloading'})
        .where({ id: input.id });

    status = await ctx.avatar
        .getInputStatus(account.id, input.id);

    assert(status);
    assert(status.isRunning === true);
    assert(status.isAudioDone === false);
    assert(status.isDone === false);

    await knex('avatar_inputs')
        .update({ status: 'downloaded'})
        .where({ id: input.id });


    status = await ctx.avatar
        .getInputStatus(account.id, input.id);

    assert(status);
    assert(status.isRunning === true);
    assert(status.isDone === false);
    assert(status.isAudioDone === true);

    await knex('avatar_inputs')
        .update({ status: 'transcribed'})
        .where({ id: input.id });

    status = await ctx.avatar
        .getInputStatus(account.id, input.id);

    assert(status);
    assert(status.isRunning === true);
    assert(status.isDone === false);
    assert(status.isAudioDone === true);
    assert(status.isTranscriptionDone === true);

    await knex('avatar_inputs')
        .update({ status: 'done'})
        .where({ id: input.id });

    status = await ctx.avatar
        .getInputStatus(account.id, input.id);

    assert(status);
    assert(status.isDone === true);
    assert(status.isRunning === false);
    assert(status.isAudioDone === true);
    assert(status.isTranscriptionDone === true);
});

test('[ModelAvatar] getInputById', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    const dbInput = await ctx.avatar.getInputById(
        input.id
    );

    assert.strictEqual(dbInput.id, input.id);
    assert.strictEqual(dbInput.status, 'waiting');
});

test('[ModelAvatar] getInputByAccountAndId', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    const dbInput = await ctx.avatar.getInputByAccountAndId(
        account.id,
        input.id
    );

    assert.strictEqual(dbInput.id, input.id);
    assert.strictEqual(dbInput.status, 'waiting');
});

test('[ModelAvatar] updateAvatarInputFilepathAndStatus', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    await ctx.avatar.updateAvatarInputFilepathAndStatus(
        input.id,
        'foobar'
    );

    const dbInput = await ctx.avatar.getInputById(
        input.id
    );

    assert.strictEqual(dbInput.id, input.id);
    assert.strictEqual(dbInput.status, 'downloaded');
});


test('[ModelAvatar] updateAvatarInputTranscriptionAndStatus / getInputById', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    await ctx.avatar.updateAvatarInputTranscriptionAndStatus(
        input.id,
        'foobar'
    );

    const dbInput = await ctx.avatar.getInputById(
        input.id
    );

    assert.strictEqual(dbInput.id, input.id);
    assert.strictEqual(dbInput.status, 'transcribed');
});

test('[ModelAvatar] updateAvatarInputFullTextAndStatus', async () => {
    const ctx = new Context();
    const client = new Avatar(ctx);
    const link = `spec_${new Date().getTime()}`;

    const account = await ctx.account.create({
        title: 'Foo',
        link
    });

    accountIds.push(account.id);

    const avatar = await client.create(
        account.id,
        { name: 'Foo', system_prompt: 'Bar' }
    );

    avatarIds.push(avatar.id);

    const input = await ctx.avatar
        .createInput(account.id, 'https://www.youtube.com/watch?v=CPNUQskQLlA');

    await ctx.avatar.updateAvatarInputFullTextAndStatus(
        input.id,
        'foobar'
    );

    const dbInput = await ctx.avatar.getInputById(
        input.id
    );

    assert.strictEqual(dbInput.id, input.id);
    assert.strictEqual(dbInput.status, 'done');
});