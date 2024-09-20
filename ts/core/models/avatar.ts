import BaseModel from './base.js';

export interface Avatar {
    id: string;
    account_id: string;
    name: string;
    system_prompt: string;
}

export interface AvatarCreate {
    name: string;
    system_prompt: string;
}

class AvatarModel extends BaseModel {
    async create(accountId: string, { name, system_prompt }: {
        name: string,
        system_prompt: string
    }): Promise<Avatar> {
        const insertResponse = await this.knex('avatars').insert({
            account_id: accountId,
            name,
            system_prompt
        }).returning('*');

        return insertResponse[0];
    }
}

export default AvatarModel;
