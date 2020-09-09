/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const getRandomColor = require('../utils/getRandomColor');
const passwordHash = require('../utils/passwordHash');

let GLOBAL_USER_ID = 0;

function User(opts)
{
    this.id = opts.id || ++GLOBAL_USER_ID;
    this.login = opts.login;
    this.hash = opts.hash;
    this.color = opts.color || getRandomColor();
}

User.prototype.verifyPassword = function (password)
{
    return passwordHash.verify(password, this.hash);
};

User.createPasswordHash = function (password)
{
    return passwordHash.hash(password);
};

module.exports = User;
