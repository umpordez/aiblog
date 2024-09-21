import assert from 'node:assert';
import test, { after } from 'node:test';

import '../test-helper.js';

import Redis from '../../core/models/redis.js';
import Context from '../../core/context.js';

after(async () => {
    const ctx = new Context();
    const redis = new Redis(ctx);

    await redis.quit();
});

test('[ModelRedis] initialize / sanitize', () => {
    const ctx = new Context();
    const client = new Redis(ctx);

    assert(client);
});

test('[ModelRedis] pub / sub', async () => {
    const ctx = new Context();
    const client = new Redis(ctx);

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const timer = setTimeout(() => {
            reject('Unexpected');
        }, 1000)

        await client.subscribe('test-test', async () => {
            clearTimeout(timer);
            resolve();
        });

        client.publish('test-test', 'foobar');
    });
});