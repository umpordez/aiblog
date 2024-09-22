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

        req.ctx
            .redis
            .publishNoWait('avatar-input-created', avatarInput.id);

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

router.get(
    '/avatar-input/:avatarInputStatusId',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const avatarInput = await req.ctx.avatar
            .getInput(req.account.id, req.params.avatarInputStatusId);

        res.status(200).json({ ok: true, ...avatarInput });
    }));

router.post(
    '/create-post',
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.ctx || !req.account) {
            throw new Error('UH Oh! Something veeeery odd is happening...')
        }

        const blogPostData = {
            avatar_id: req.body.avatarId,
            title: req.body.title,
            description: req.body.description
        };

        const blogPost = await req.ctx.blog
            .createPost(req.account.id, blogPostData);

        res.status(200).json({ ok: true, blogPostId: blogPost.id });
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