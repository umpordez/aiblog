import BaseModel from './base';

export interface Account {
    id: string;
    title: string;
    link: string;
}

class AccountModel extends BaseModel {
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
}

export default AccountModel;
