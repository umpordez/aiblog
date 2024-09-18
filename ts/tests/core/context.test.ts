import assert from 'node:assert';
import test from 'node:test';

import '../test-helper';

import Context from '../../core/context';

test('[Context] initialize / sanitize', () => {
    const ctx = new Context();
    assert(ctx);
    assert(ctx.account);
    assert(ctx.user);
    assert(ctx.avatar);
});