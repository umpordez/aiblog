
import assert from 'node:assert';
import test, { afterEach } from 'node:test';

import '../test-helper.js';

import Blog from '../../core/models/blog.js';
import Context from '../../core/context.js';

import knex from '../../core/knex.js';

const userIds : string[] = [];
const accountIds : string[] = [];

afterEach(async () => {
    while (accountIds.length) {
        const accountId = accountIds.pop();

        await knex('user_in_accounts').where({ account_id: accountId }).del();
        await knex('blog_posts').where({ account_id: accountId }).del();
        await knex('avatars').where({ account_id: accountId }).del();
        await knex('accounts').where({ id: accountId }).del();
    }

    while (userIds.length) {
        const userId = userIds.pop();

        await knex('user_in_accounts').where({ user_id: userId }).del();
        await knex('users').where({ id: userId }).del();
    }
});

test('[ModelBlog] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new Blog(ctx);

    assert(client);
});

test('[ModelBlog] can create :D', async () => {
    const ctx = new Context();
    const client = new Blog(ctx);
    const link = `spec_${new Date().getTime()}`;

    const { account, user, avatar } = await client.create({
        name: 'Test',
        email: `spec_${new Date().getTime()}`,
        password: 'foobar'
    }, {
        title: 'Foo',
        link,
        ai_api_key: 'foo'
    }, {
        name: 'Foozao',
        system_prompt: 'Test test'
    });

    assert(account);
    assert(account.id);
    assert(account.title === 'Foo');
    assert(account.link === link);

    assert(avatar);
    assert(user);

    accountIds.push(account.id);
    userIds.push(user.id);
});

test('[ModelBlog] createPost/getPostById/getAllPosts', async () => {
    const ctx = new Context();
    const client = new Blog(ctx);

    const { account, user, avatar } = await client.create({
        name: 'Test',
        email: `spec_${new Date().getTime()}`,
        password: 'foobar'
    }, {
        title: 'Foo',
        link: `spec_${new Date().getTime()}`,
        ai_api_key: 'foo'
    }, {
        name: 'Foozao',
        system_prompt: 'Test test'
    });

    assert(account);
    assert(account.id);
    assert(account.title === 'Foo');
    assert(account.link === 'bar');

    assert(avatar);
    assert(user);

    const allPostsBefore = await client.getAllPostsByAccountId(
        account.id
    );

    assert(allPostsBefore.length === 0)

    accountIds.push(account.id);
    userIds.push(user.id);

    const post = await client.createPost(account.id, {
        avatar_id: avatar.id,
        title: 'foo',
        description: 'bar'
    });

    assert(post)
    assert(post.id)

    const dbPost = await client.getPostById(account.id, post.id);

    assert(dbPost.id === post.id);
    assert(dbPost.title === post.title);

    const allPostsAfter = await client.getAllPostsByAccountId(
        account.id
    );

    assert(allPostsAfter.length === 1)
    assert(allPostsAfter[0].id === dbPost.id);
});