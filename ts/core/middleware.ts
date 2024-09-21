import type {
    Request,
    Response,
    NextFunction
} from 'express';
import logger from './logger.js';

import type { Account } from './models/account.js';
import type { User } from './models/user.js';
import type Context from './context.js';
import jwt from 'jsonwebtoken';

export interface AiBlogRequest extends Request {
    ctx?: Context;
    account?: Account;
    user?: User;
}

export function requestLogger (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { ip, method, url, headers } = req;
    const { account_id, user_id } = headers;

    const id = new Date().getTime();

    let idsMsg = '';
    if (user_id) { idsMsg += ` _ u=${user_id}`; }
    if (account_id) { idsMsg += ` _ a=${account_id}`; }

    if (process.env.DEBUG) {
        const msg = `[${ip}] {${method}} ${id} - Receiving ${url}`;
        logger.info(`${msg}${idsMsg}`);
    }

    const started = new Date().getTime();

    res.on('finish', () => {
        const took = new Date().getTime() - started;

        logger.info(`{req} [${ip}] ${method} ` +
            `${url}${idsMsg} : http=${res.statusCode} ${took}ms`);
    });

    next();
}

export async function resolveBlogLinkMiddleware(
    req: AiBlogRequest,
    _res: Response,
    next: NextFunction
) {
    try {
        if (!req.ctx) { throw new Error('Something went wrong.'); }
        const account = await req.ctx.account.getByLink(req.params.blogLink);
        req.account = account;

        next();
    } catch (ex: unknown) {
        let error = new Error();

        if (ex instanceof Error) {
            error = ex;
        } else if (typeof ex === 'string') {
            error = new Error(ex);
        } else {
            error.message = `Unexpected Throw: ${typeof ex}`;
        }

        logger.error(error);
        next(error);
    }
}

export async function demandAdminBlogAccessMiddleware(
    req: AiBlogRequest,
    _res: Response,
    next: NextFunction
) {
    try {
        if (!req.account || !req.user || !req.ctx) {
            throw new Error('Forbidden!!! :x');
        }

        await req.ctx.account.demandUserAccess(req.account.id, req.user.id);
        next();
    } catch (ex: unknown) {
        let error = new Error();

        if (ex instanceof Error) {
            error = ex;
        } else if (typeof ex === 'string') {
            error = new Error(ex);
        } else {
            error.message = `Unexpected Throw: ${typeof ex}`;
        }

        logger.error(error);
        next(error);
    }
}

interface JwtPayload {
    userId: string
}

export async function trySetUserMiddleware (
    req: AiBlogRequest,
    _res: Response,
    next: NextFunction
) {
    try {
        const token = req.headers.authorization || '';
        if (!token) {
            return next();
        }

        jwt.verify(token, process.env.HTTP_SECRET as string);
        const decoded = jwt.decode(token) as JwtPayload;
        const userId = decoded.userId;

        const user = await req.ctx?.user.getById(userId);
        req.user = user;

        next();
    } catch (ex: unknown) {
        let error = new Error();

        if (ex instanceof Error) {
            error = ex;
        } else if (typeof ex === 'string') {
            error = new Error(ex);
        } else {
            error.message = `Unexpected Throw: ${typeof ex}`;
        }

        logger.error(error);
        next(error);
    }
}