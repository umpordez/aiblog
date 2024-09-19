import Account from './models/account.js';
import User from './models/user.js';
import Avatar from './models/avatar.js';

class Context {
    account: Account;
    user: User;
    avatar: Avatar;

    constructor() {
        this.account = new Account(this);
        this.user = new User(this);
        this.avatar = new Avatar(this);
    }
}

export default Context;
