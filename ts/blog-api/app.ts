import express from 'express';
import type { NextFunction, Response } from 'express';

import logger from '../core/logger.js';
import { requestLogger, trySetUserMiddleware } from '../core/middleware.js';
import Context from '../core/context.js';

import type { ApiRequest } from './utils.js';
import {
    buildHandler
} from './utils.js';

import makeAuthEndpoint from './endpoints/auth.js';
import makeBlogAdminEndpoint from './endpoints/blog-admin.js';
import makeBlogEndpoint from './endpoints/blog.js';

const app = express();

function fatalHandler(err: Error) {
    logger.error(err, { FATAL: true });
    process.exit(1);
}

process.on('uncaughtException', fatalHandler);
process.on('unhandledRejection', fatalHandler);

app.use(requestLogger);
app.use(express.json());

function allowCrossDomain(req: ApiRequest, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', "true");

    if (req.method === 'OPTIONS') { return res.sendStatus(200); }
    next();
}

app.use(allowCrossDomain);
app.use((req: ApiRequest, _res: Response, next: NextFunction) => {
    const context = new Context();
    req.ctx = context;

    next();
});

app.get('/', buildHandler(async (_req: ApiRequest, res: Response) => {
    res.status(200).json({ ok: true, message: 'Hello World' });
}));

app.get(
    '/blogs',
    buildHandler(async (req: ApiRequest, res: Response) => {
        const accounts = await req.ctx?.account.getAll();
        res.status(200).json({ blogs: accounts });
    }));

app.get(
    '/me',
    trySetUserMiddleware,
    buildHandler(async (req: ApiRequest, res: Response) => {
        if (!req.user) {
            res.status(200).json({ user: null });
            return;
        }

        const accounts = await req.ctx?.account.getAllByUser(req.user.id);
        res.status(200).json({ user: req.user, accounts });
    }));

makeAuthEndpoint(app);
makeBlogAdminEndpoint(app);
makeBlogEndpoint(app);

app.use((err: Error, _req: ApiRequest, res: Response) => {
    const statusCode = /Forbidden/.test(err.message) ? 403 : 500;
    res.status(statusCode).send(err.message)
})

app.listen(process.env.BLOG_API_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_API_PORT}`);
});