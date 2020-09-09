/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const User = require('../models/User');
const BaseStore = require('./BaseStore');
const inherits = require('util').inherits;

function UserStore()
{
    BaseStore.call(this);
}
inherits(UserStore, BaseStore);

UserStore.prototype.createUser = function (login, password)
{
    if (!login || !password)
        throw new Error('ArgumentNullException');

    return this.getByLogin(login)
               .then(u =>
               {
                   if (!!u)
                       throw new Error('UserAlreadyExists');

                   return User.createPasswordHash(password);
               })
               .then(hash =>
               {
                   let user = new User({login, hash});
                   this.items.push(user);
                   return user;
               });
};

UserStore.prototype.getByLogin = function (login)
{
    if (!login)
        throw new Error('ArgumentNullException');
    login = login.toLowerCase();
    let user = this.items.filter(x => x.login.toLowerCase() === login)[0] || null;
    return Promise.resolve(user);
};

module.exports = UserStore;