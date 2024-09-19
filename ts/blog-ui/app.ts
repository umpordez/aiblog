import path from 'node:path';

import dotenv from "dotenv";
import express from 'express';
import type { NextFunction, Response } from 'express';
import dirname from "../dirname.js";

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
                    ...getPage(req.url),
                    ...(options || {})
                });
            };

            await fn(req, res);
        } catch (ex) {
            console.error(ex);
            res.render('404', { page: getPage(req.url) });
        }
    };
}


app.get('/', buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('home');
}));

app.get(
    '/blog/:blogLink',
    resolveBlogLinkMiddleware,
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('blog/home-account');
    }));

app.get(
    '/blog/:blogLink/create-post',
    resolveBlogLinkMiddleware,
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('blog-admin/create-post');
    }));

app.get(
    '/blog/:blogLink/post/:postLink',
    resolveBlogLinkMiddleware,
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('blog/post-view');
    }));

app.get('/login', buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('auth/login');
}));

app.get(
    '/create-account',
    buildHandler(async (_req: AiBlogRequest, res: Response) => {
        res.render('auth/create-account');
    }));

app.use(buildHandler(async (_req: AiBlogRequest, res: Response) => {
    res.render('404');
}));

app.listen(process.env.BLOG_UI_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_UI_PORT}`);
});
