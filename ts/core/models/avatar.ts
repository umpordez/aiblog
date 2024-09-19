import BaseModel from './base.js';

export interface Avatar {
    id: string;
    account_id: string;
    name: string;
    system_prompt: string;
}

class AvatarModel extends BaseModel {
    async create(accountId: string, { name, description }: {
        name: string,
        description: string
    }): Promise<Avatar> {
        const insertResponse = await this.knex('avatars').insert({
            account_id: accountId,
            name,
            system_prompt: description
        }).returning('*');

        return insertResponse[0];
    }
}

export default AvatarModel;
