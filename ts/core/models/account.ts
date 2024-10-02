import BaseModel from './base.js';

export interface Account {
    id: string;
    title: string;
    link: string;
    ai_api_key: string;
    utc_created_on: Date
}

export interface AccountCreate {
    title: string;
    link: string;
    ai_api_key?: string;
}

class AccountModel extends BaseModel {
    async getAll() {
        return this.knex('accounts').orderBy('title', 'asc');
    }

    async create({ title, link }: {
        title: string,
        link: string
    }): Promise<Account> {
        const insertResponse = await this.knex('accounts').insert({
            title,
            link
        }).returning('*');

        return insertResponse[0];
    }

    async addUser(id: string, userId: string, role: 'admin'): Promise<void> {
        await this.knex('user_in_accounts').insert({
            user_id: userId,
            account_id: id,
            role
        });
    }

    async getById(id: string): Promise<Account> {
        const acc = await this.knex('accounts').where({ id }).first();

        if (!acc) { 
            throw new Error('Account not found.');
        }

        return acc;
    }

    async getByLink(link: string): Promise<Account> {
        const acc = await this.knex('accounts').where({ link }).first();

        if (!acc) { 
            throw new Error('Account not found.');
        }

        return acc;
    }

    async getAllByUser(userId: string) : Promise<Account[]> {
        const accounts = await this
            .knex('accounts as a')
            .join('user_in_accounts as ua', {
                'ua.account_id': 'a.id'
            })
            .where({ user_id: userId })
            .select('a.*');

        return accounts;
    }

    async demandUserAccess(accountId: string, userId: string) : Promise<void> {
        const userInAccount = await this.knex('user_in_accounts').where({
            account_id: accountId,
            user_id: userId
        }).first();

        if (!userInAccount) {
            throw new Error(`User: ${userId} has no access to: ${accountId}`);
        }
    }
}

export default AccountModel;
