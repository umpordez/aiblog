import type { Response, Express } from 'express';
import express from 'express';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

import {
    resolveBlogLinkMiddleware,
    trySetUserMiddleware
} from '../../core/middleware.js';

const router = express.Router();

router.get(
    '/post/:postId',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const blogPost = await req.ctx
            .blog
            .getById(req.account.id, req.params.postId);

        res.status(200).json({ ok: true, ...blogPost })
    }));

router.get(
    '/posts',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const blogPosts = await req.ctx
            .blog
            .getAllPostsByAccountId(req.account.id);

        res.status(200).json([ ...blogPosts ])
    }));

export default function makeEndpoint (app: Express) {
    app.use(
        '/blog/:blogLink',
        trySetUserMiddleware,
        resolveBlogLinkMiddleware,
        router
    );
}