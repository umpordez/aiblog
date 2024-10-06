import type { Response, Express } from 'express';
import express from 'express';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

import {
    resolveBlogLinkMiddleware,
    trySetUserMiddleware
} from '../../core/middleware.js';

const router = express.Router();

async function getPostHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const blogPost = await req.ctx
        .blog
        .getPostById(req.account.id, req.params.postId);

    res.status(200).json({ ok: true, ...blogPost });
}

async function getAllPostHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const blogPosts = await req.ctx
        .blog
        .getAllPostsByAccountId(req.account.id);

    res.status(200).json({
        account: { title: req.account.title, id: req.account.id },
        blogPosts
    });
}

router.get('/post/:postId', buildHandler(getPostHandler));
router.get('/posts', buildHandler(getAllPostHandler));

export default function makeEndpoint (app: Express) {
    app.use(
        '/blog/:blogLink',
        trySetUserMiddleware,
        resolveBlogLinkMiddleware,
        router
    );
}