import type { Response, Express } from 'express';

import jwt from 'jsonwebtoken';
import express from 'express';

import type { ApiRequest  } from '../utils.js';
import { buildHandler } from '../utils.js';

const router = express.Router();

async function handleCreateAccount(
    req: ApiRequest,
    res: Response
) : Promise<void> {
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
}

async function handleLogin(
    req: ApiRequest,
    res: Response
) : Promise<void> {
    const { email, password } = req.body;

    const loginResponse = await req.ctx?.user.login(email, password);

    if (!loginResponse) {
        throw new Error('Invalid login data');
    }

    const tokenData = {
        userId: loginResponse.id,
        utc_last_logon: new Date()
    };
    const token = jwt.sign(
        tokenData,
        process.env.HTTP_SECRET as string
    );
    res.status(200).json({ userId: loginResponse.id, token });
}

router.post('/create-account', buildHandler(handleCreateAccount));
router.post('/login', buildHandler(handleLogin));

export default function makeEndpoint (app: Express) {
    app.use('/auth', router)
}