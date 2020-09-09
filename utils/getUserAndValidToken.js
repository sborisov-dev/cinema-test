/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const UserStore = require('../data/UserStore');
const TokenStore = require('../data/TokenStore');

module.exports = function (accessToken, app)
{
    let userStore = app.getStore(UserStore),
        tokenStore = app.getStore(TokenStore);

    if (!accessToken)
        return Promise.resolve(null);

    let token = tokenStore.getByToken(accessToken);

    if (!token)
        return Promise.resolve(null);

    return userStore
        .getById(token.userId)
        .then(user =>
        {
            return user && tokenStore.validate(token, user) && {token, user} || null;
        });
};