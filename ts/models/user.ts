import BaseModel from './base';

export interface User {
    id: string;
    email: string;
    name: string;
    utc_created_on: Date;
}

class UserModel extends BaseModel {
    async create({ name, email, password } : {
        name: string,
        email: string,
        password: string
    }): Promise<User> {
        const insertResponse = await this.knex('users').insert({
            name,
            email,
            password
        }).returning('*');

        return insertResponse[0];
    }
}

export default UserModel;
