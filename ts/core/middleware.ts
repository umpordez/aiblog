import type {
    Request,
    Response,
    NextFunction
} from 'express';
import logger from './logger.js';

import type { Account } from './models/account.js';
import type Context from './context.js';

export interface AiBlogRequest extends Request {
    ctx?: Context;
    account?: Account;
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
    _req: Request,
    _res: Response,
    next: NextFunction
) {
    try {
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
