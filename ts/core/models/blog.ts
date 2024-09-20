import BaseModel from './base.js';

import type { Account, AccountCreate } from './account.js';
import type { User, UserCreate } from './user.js';
import type { Avatar, AvatarCreate } from './avatar.js';

class BlogModel extends BaseModel {
    async create(
        user: UserCreate,
        account: AccountCreate,
        avatar: AvatarCreate
    ) : Promise<{
        account: Account,
        user: User,
        avatar: Avatar
    }> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                await this.context.knexTransaction(async() => {
                    const dbUser = await this.context.user
                        .create(user);

                    const dbAccount = await this.context.account
                        .create(account);

                    const dbAvatar = await this.context.avatar
                        .create(dbAccount.id, avatar);

                    await this.context.account.addUser(
                        dbAccount.id,
                        dbUser.id,
                        'admin'
                    );

                    resolve({
                        account: dbAccount,
                        user: dbUser,
                        avatar: dbAvatar
                    });
                });
            } catch (ex) {
                reject(ex);
            }
        })
    }
}

export default BlogModel;
