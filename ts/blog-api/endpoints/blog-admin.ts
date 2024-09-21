import type { Response, Express } from 'express';
import express from 'express';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

import {
    resolveBlogLinkMiddleware,
    trySetUserMiddleware,
    demandAdminBlogAccessMiddleware
} from '../../core/middleware.js';

const router = express.Router();

router.post(
    '/create-post',
    buildHandler(async (req: ApiRequest, res: Response) => {
        console.log(req.body);
}));

export default function makeEndpoint (app: Express) {
    app.use(
        '/blog-admin/:blogLink',
        trySetUserMiddleware,
        resolveBlogLinkMiddleware,
        demandAdminBlogAccessMiddleware,
        router
    );
}