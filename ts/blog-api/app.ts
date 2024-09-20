import express from 'express';
import type { NextFunction, Response } from 'express';

import logger from '../core/logger.js';
import { requestLogger } from '../core/middleware.js';
import type { AiBlogRequest } from '../core/middleware.js';
import jwt from 'jsonwebtoken';

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

app.post(
    '/create-account',
    buildHandler(async (req: ApiRequest, res: Response) => {
        const { account, user, avatar } = req.body;

        avatar.name = avatar.avatar_name;
        avatar.system_prompt = avatar.avatar_description;

        const blogResponse = await req.ctx?.blog.create(user, account, avatar);

        if (!blogResponse) {
            throw new Error('Invalid blog create response!');
        }

        res.status(200).json({
            accountId: blogResponse.account.id,
            userId: blogResponse.user.id,
            avatarId: blogResponse.avatar.id,
            ok: true
        });
}));

app.post(
    '/login',
    buildHandler(async (req: ApiRequest, res: Response) => {
        const { email, password } = req.body;

        const loginResponse = await req.ctx?.user.login(email, password);

        if (!loginResponse) {
            throw new Error('Invalid login data');
        }

        const tokenData = {
            userId: loginResponse.id,
            utc_last_logon: new Date()
        };
        const token = jwt.sign(tokenData, process.env.HTTP_SECRET);
        res.status(200).json({ userId: loginResponse.id, token })
}));

app.listen(process.env.BLOG_API_PORT, () => {
    logger.info(`http server opened on ${process.env.BLOG_API_PORT}`);
});