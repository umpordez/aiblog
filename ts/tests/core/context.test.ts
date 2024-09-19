import assert from 'node:assert';
import test from 'node:test';

import '../test-helper.js';

import Context from '../../core/context.js';

test('[Context] initialize / sanitize', () => {
    const ctx = new Context();
    assert(ctx);
    assert(ctx.account);
    assert(ctx.user);
    assert(ctx.avatar);
});