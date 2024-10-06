import BaseModel from './base.js';

import type { Account, AccountCreate } from './account.js';
import type { User, UserCreate } from './user.js';
import type { Avatar, AvatarCreate } from './avatar.js';

interface BlogPostData {
    avatar_id: string;
    title: string;
    description: string;
    origin_youtube_url: string;
}

interface BlogPost extends BlogPostData {
    id: string;
    utc_created_on: Date;
}

class BlogModel extends BaseModel {
    async getPostById(accountId: string, postId: string) : Promise<BlogPost> {
        const blogPost = await this.knex('blog_posts').where({
            id: postId,
            account_id: accountId
        }).first();

        return blogPost;
    }

    async getAllPostsByAccountId(accountId: string) : Promise<BlogPost[]> {
        return await this.knex('blog_posts').where({
            account_id: accountId
        }).orderBy('utc_created_on', 'desc');
    }

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

    async createPost(
        accountId: string,
        blogPostData: BlogPostData
    ) : Promise<BlogPost> {
        const insertData = await this.knex('blog_posts').insert({
            account_id: accountId,
            ...blogPostData
        }).returning('*');

        return insertData[0];
    }
}

export default BlogModel;
