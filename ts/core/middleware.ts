import type { Request, Response, NextFunction } from 'express';
import logger from './logger';

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