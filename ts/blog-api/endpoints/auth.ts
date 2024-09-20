import type { Express } from 'express';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

import type { AiBlogRequest } from '../../core/middleware.js';

interface ApiRequest extends AiBlogRequest {
    headers: {
        origin?: string;
    }
}

export default function makeEndpoint (
    app: Express,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildHandler: (fn: (req: ApiRequest, res: Response) => void) => any
) {
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
}