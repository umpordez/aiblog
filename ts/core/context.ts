import Account from './models/account.js';
import User from './models/user.js';
import Avatar from './models/avatar.js';
import Blog from './models/blog.js';
import Redis from './models/redis.js';

import knex from './knex';
import BaseModel from './models/base.js';

class Context {
    account: Account;
    user: User;
    avatar: Avatar;
    blog: Blog;
    redis: Redis;

    constructor() {
        this.account = new Account(this);
        this.user = new User(this);
        this.avatar = new Avatar(this);
        this.blog = new Blog(this);
        this.redis = new Redis(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    async knexTransaction(fn: Function) {
        try {
            await knex.transaction(async (trx) => {
                for (const key in this) {
                    if (this[key] instanceof BaseModel) {
                        this[key].knex = trx;
                    }
                }

                await fn();
            });
        } finally {
            for (const key in this) {
                if (this[key] instanceof BaseModel) {
                    this[key].knex = knex;
                }
            }
        }

    }
}

export default Context;
