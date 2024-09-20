import express from 'express';
import type { NextFunction, Response } from 'express';

import logger from '../core/logger.js';
import { requestLogger } from '../core/middleware.js';
import type { AiBlogRequest } from '../core/middleware.js';
import makeAuthEndpoint from './endpoints/auth.js';

import Context from '../core/context.js';

const app = express();

function fatalHandler(err: Error) {
    logger.error(err, { FATAL: true });
    process.exit(1);
}

process.on('uncaughtException', fatalHandler);
process.on('unhandledRejection', fatalHandler);

app.use(requestLogger);
app.use(express.json());

interface ApiRequest extends AiBlogRequest {
    headers: {
        origin?: string;
    }
}
type Handler = (req: ApiRequest, res: Response) => Promise<void>;

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

function buildHandler(fn: Handler) {
    return async (req: ApiRequest, res: Response) => {
        try {
            await fn(req, res);
        } catch (ex) {
            console.error(ex);

            if (ex instanceof Error) {
                res.status(500).json({ message: ex.message });
                return;
            }

            res.status(500).json({ message: 'uh oh! tenta depois...' });
        }
    };
}

app.get('/', buildHandler(async (_req: ApiRequest, res: Response) => {
    res.status(200).json({ ok: true, message: 'Hello World' });
}));

makeAuthEndpoint(app, buildHandler);

app.listen(process.env.BLOG_API_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_API_PORT}`);
});