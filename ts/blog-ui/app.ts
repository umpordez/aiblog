import path from 'node:path';

import dotenv from "dotenv";
import express from 'express';
import type { NextFunction, Response } from 'express';
import dirname from "../dirname.js";

import knex from '../core/knex.js';

import logger from '../core/logger.js';
import {
    requestLogger,
    resolveBlogLinkMiddleware
} from '../core/middleware.js';
import type { AiBlogRequest } from '../core/middleware.js';

import Context from '../core/context.js';

dotenv.config({ path: path.resolve(dirname, '.env') });

const app = express();

app.use(express.static(path.resolve(dirname, './blog-ui/public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(dirname, './blog-ui/views/'));

function fatalHandler(err: Error) {
    logger.error(err, { FATAL: true });
    process.exit(1);
}

process.on('uncaughtException', fatalHandler);
process.on('unhandledRejection', fatalHandler);

app.use(requestLogger);

interface PageConfig {
    title: string;
    description: string;
    image: string;
    site: string;
    creator: string;
    url?: string
}

const configByUrl = {
    '': {
        title: 'aiblog',
        description: 'aiblog',
        image: '',
        site: '',
        creator: 'Deividy Metheler Zachetti'
    }
};

function getPage(url: string) : PageConfig {
    const cfg : PageConfig = {
        url,
        ...(configByUrl[url as keyof typeof configByUrl] || configByUrl[''])
    };

    return cfg;
}

type Handler = (req: AiBlogRequest, res: Response) => Promise<void>;

app.use((req: AiBlogRequest, _res: Response, next: NextFunction) => {
    const context = new Context();
    req.ctx = context;

    next();
});

function buildHandler(fn: Handler) {
    return async (req: AiBlogRequest, res: Response) => {
        try {
            const _render = res.render.bind(res);

            res.render = (tpl: string, options?: object) => {
                const cfg : { page: PageConfig } = { page: configByUrl[''] };

                return _render(tpl, {
                    ...cfg,
                    ...(options || {}),
                    baseUrl: req.account ? `/blog/${req.account.link}` : '/',
                    accountLink: req.account?.link || '',
                    baseApiUrl: process.env.BASE_API_URL as string
                });
            };

            await fn(req, res);
        } catch (ex) {
            console.error(ex);
            res.render('pages/404', { page: getPage(req.url) });
        }
    };
}

app.get('/', buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('pages/home');
}));

app.get(
    '/blog/:blogLink',
    resolveBlogLinkMiddleware,
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('pages/blog/home-account');
    }));

app.get(
    '/blog/:blogLink/create-post',
    resolveBlogLinkMiddleware,
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('pages/blog-admin/create-post');
    }));

app.get(
    '/blog/:blogLink/post/:postId',
    resolveBlogLinkMiddleware,
    buildHandler(async (req: AiBlogRequest, res: Response) => {
        const { postId } = req.params;
        const blogPost = await knex('blog_posts').where({
            id: postId
        }).first();

        res.render('pages/blog/post-view', {
            page: {
                title: blogPost.title,
                description: blogPost.short_description,
                image: 'https://s3.sa-east-1.amazonaws.com/' +
                    'public.obonde/iseiv2/u/' + 
                    '7130f128-5528-4c11-a4da-ea8f5aec2a83/' +
                    '5b6070ec-8c55-463e-b6c4-89e2aee89702-logo_copy.png',
                site: req.url,
                creator: 'Deividy Metheler Zachetti'
            },
            postId: req.params.postId
        });
    }));

app.get(
    '/blog/:blogLink/avatar-input-status/:avatarInputId',
    resolveBlogLinkMiddleware,
    buildHandler(async (req: AiBlogRequest, res: Response) => {
        res.render('pages/blog-admin/avatar-input-status', {
            avatarInputId: req.params.avatarInputId
        });
    }));

app.get(
    '/blog/:blogLink/avatar-input/:avatarInputId',
    resolveBlogLinkMiddleware,
    buildHandler(async (req: AiBlogRequest, res: Response) => {
        res.render('pages/blog-admin/avatar-input', {
            avatarInputId: req.params.avatarInputId
        });
    }));

app.get('/login', buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('pages/auth/login');
}));

app.get(
    '/my-account',
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('pages/my-account');
    }));

app.get(
    '/create-account',
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('pages/auth/create-account');
    }));

app.use(buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('pages/404');
}));

app.listen(process.env.BLOG_UI_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_UI_PORT}`);
});
