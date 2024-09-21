import type { Response, Express } from 'express';
import express from 'express';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

import {
    resolveBlogLinkMiddleware,
    trySetUserMiddleware,
    demandAdminBlogAccessMiddleware
} from '../../core/middleware.js';

const router = express.Router();

router.post(
    '/init-post',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const youtubeUrl = req.body.youtube_url as string;
        const avatarInput = await req.ctx.avatar
            .createInput(req.account.id, youtubeUrl);

        await req.ctx.redis.publish('avatar-input-created', avatarInput.id);

        res.status(200).json({
            ok: true,
            avatarInputId: avatarInput.id
        });
    }));

router.get(
    '/avatar-input-status/:avatarInputStatusId',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const avatarInputStatus = await req.ctx.avatar
            .getInputStatus(req.account.id, req.params.avatarInputStatusId);

        res.status(200).json({ ok: true, ...avatarInputStatus });
    }));

export default function makeEndpoint (app: Express) {
    app.use(
        '/blog-admin/:blogLink',
        trySetUserMiddleware,
        resolveBlogLinkMiddleware,
        demandAdminBlogAccessMiddleware,
        router
    );
}