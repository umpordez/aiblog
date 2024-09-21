import bcrypt from 'bcrypt';
import BaseModel from './base.js';

const SALT_ROUNDS = 10;

export interface User {
    id: string;
    email: string;
    name: string;
    utc_created_on: Date;
}

export interface UserCreate {
    email: string;
    name: string;
    password?: string;
}


class UserModel extends BaseModel {
    async login(email: string, password: string) : Promise<User> {
        const user = await this.knex('users').where({ email }).first();

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }

        const isSamePass = await bcrypt.compare(password, user.password);

        if (!isSamePass) {
            throw new Error('Invalid password');
        }

        return user;
    }

    async create({ name, email, password } : {
        name: string,
        email: string,
        password?: string
    }): Promise<User> {
        if (!password) { throw new Error('Password was not passed'); }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const insertResponse = await this.knex('users').insert({
            name,
            email,
            password: hashedPassword
        }).returning('*');

        return insertResponse[0];
    }

    async getById(userId: string) : Promise<User> {
        const user = await this.knex('users').where({ id: userId }).first();

        return user;
    }
}

export default UserModel;
