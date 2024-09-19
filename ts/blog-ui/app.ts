import path from 'node:path';

import dotenv from "dotenv";
import express from 'express';
import type { Request, Response } from 'express';
import { __filename } from "__filename";

import logger from '../core/logger';
import { requestLogger } from '../core/middleware';

const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

app.use(express.static(path.resolve(__dirname, './blog-ui/public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './blog-ui/views/'));

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

type Handler = (req: Request, res: Response) => Promise<void>;

function buildHandler(fn: Handler) {
    return async (req: Request, res: Response) => {
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
            // MAY go to error page?
            console.error(ex);
            res.render('404', { page: getPage(req.url) });
        }
    };
}

app.get('/', buildHandler(async (req: Request, res: Response) => {
    res.render('home');
}));

app.get(
    '/blog/:link',
    buildHandler(async (req: Request, res: Response) => {
        res.render('blog/home-account');
    }));

app.get(
    '/blog/:link/create-post',
    buildHandler(async (req: Request, res: Response) => {
        res.render('blog-admin/create-post');
    }));

app.get(
    '/blog/:link/post/:postLink',
    buildHandler(async (req: Request, res: Response) => {
        res.render('blog/post-view');
    }));

app.get('/login', buildHandler(async (req: Request, res: Response) => {
    res.render('auth/login');
}));

app.get(
    '/create-account',
    buildHandler(async (req: Request, res: Response) => {
        res.render('auth/create-account');
    }));

app.use(buildHandler(async (req: Request, res: Response) => {
    res.render('404');
}));

app.listen(process.env.BLOG_UI_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_UI_PORT}`);
});
