import Account from './models/account';
import User from './models/user';
import Avatar from './models/avatar';

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
