import type { Response } from 'express';
import type { AiBlogRequest } from '../core/middleware.js';

export interface ApiRequest extends AiBlogRequest {
    headers: {
        origin?: string;
    }
}

type Handler = (req: ApiRequest, res: Response) => Promise<void>;

export function buildHandler(fn: Handler) {
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
