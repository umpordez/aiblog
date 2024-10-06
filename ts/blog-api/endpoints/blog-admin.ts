import type { Response, Express } from 'express';
import express from 'express';

import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

import {
    resolveBlogLinkMiddleware,
    trySetUserMiddleware,
    demandAdminBlogAccessMiddleware
} from '../../core/middleware.js';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const router = express.Router();

async function initPostHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const youtubeUrl = req.body.youtube_url as string;
    const avatarInput = await req.ctx.avatar
        .createInput(req.account.id, youtubeUrl);

    req.ctx
        .redis
        .publishNoWait('avatar-input:created', avatarInput.id);

    res.status(200).json({
        ok: true,
        avatarInputId: avatarInput.id
    });
}

async function getAvatarInputStatusHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const avatarInputStatus = await req.ctx.avatar
        .getInputStatus(req.account.id, req.params.avatarInputStatusId);

    res.status(200).json({ ok: true, ...avatarInputStatus });
}

async function getAvatarInputHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const avatarInput = await req.ctx.avatar
        .getInputByAccountAndId(req.account.id, req.params.avatarInputStatusId);

    res.status(200).json({ ok: true, ...avatarInput });
}

async function createPostHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const blogPostData = {
        avatar_id: req.body.avatarId,
        title: DOMPurify.sanitize(req.body.title),
        short_description: DOMPurify.sanitize(req.body.short_description),
        description: DOMPurify.sanitize(req.body.description),
        origin_youtube_url: req.body.origin_youtube_url
    };

    const blogPost = await req.ctx.blog
        .createPost(req.account.id, blogPostData);

    res.status(200).json({ ok: true, blogPostId: blogPost.id });
}

async function postAvatarInputStatusRetryHandler(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    if (!req.ctx || !req.account) {
        throw new Error('UH Oh! Something veeeery odd is happening...')
    }

    const avatarInput = await req.ctx.avatar
        .getInputByAccountAndId(req.account.id, req.params.avatarInputStatusId);

    const { status } = avatarInput;

    let redisEvent = 'avatar-input:transcribed';
    let rewindStatus :
        'transcribed' | 'waiting' | 'downloaded' = 'transcribed';

    if ([ 'waiting', 'downloading' ].includes(status)) {
        redisEvent = 'avatar-input:created';
        rewindStatus = 'waiting';
    } else if ([ 'downloaded', 'transcribing' ].includes(status)) {
        redisEvent = 'avatar-input:downloaded';
        rewindStatus = 'downloaded';
    }

    await req.ctx.avatar.updateAvatarInputData(
        avatarInput.id,
        {
            status: rewindStatus,
            error_message: null
        }
    )

    req.ctx.redis.publishNoWait(redisEvent, avatarInput.id);
    res.status(200).json({ ok: true });
}

router.post('/init-post', buildHandler(initPostHandler));
router.post('/create-post', buildHandler(createPostHandler));

router.get(
    '/avatar-input-status/:avatarInputStatusId',
    buildHandler(getAvatarInputStatusHandler));

router.get(
    '/avatar-input/:avatarInputStatusId',
    buildHandler(getAvatarInputHandler));

router.post(
    '/avatar-input-status/:avatarInputStatusId/retry',
    buildHandler(postAvatarInputStatusRetryHandler));

export default function makeEndpoint (app: Express) {
    app.use(
        '/blog-admin/:blogLink',
        trySetUserMiddleware,
        resolveBlogLinkMiddleware,
        demandAdminBlogAccessMiddleware,
        router
    );
}
