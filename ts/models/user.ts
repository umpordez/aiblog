import BaseModel from './base';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

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
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const insertResponse = await this.knex('users').insert({
            name,
            email,
            password: hashedPassword
        }).returning('*');

        return insertResponse[0];
    }
}

export default UserModel;
