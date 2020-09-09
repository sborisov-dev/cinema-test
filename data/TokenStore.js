/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const tokens = require('../utils/tokens');

function TokenStore(opts)
{
    this.expireTime = opts.expireTime || 30;
    this.slidingExpiration = opts.slidingExpiration || false;
    this.tokens = [];
}

TokenStore.prototype.generate = function (user)
{
    let data = tokens.generate(user, this.expireTime),
        tokenInfo = {
            expires: data.expires,
            createDate: data.createDate,
            token: data.token,
            userId: data.user.id
        };

    this.tokens.push(tokenInfo);
    return tokenInfo;
};

TokenStore.prototype.validate = function (it, user)
{
    let res = it && user && tokens.validate(it, user);

    if (res && this.slidingExpiration)
    {
        it.expires = new Date();
        it.expires.setMinutes(it.expires.getMinutes() + this.expireTime);
    }

    return res;
};

TokenStore.prototype.getByToken = function (token)
{
    return this.tokens.filter(x => x.token === token)[0] || null;
};

TokenStore.prototype.remove = function (token)
{
    let it = this.getByToken(token);
    let idx = this.tokens.indexOf(it);
    if (idx > -1)
        this.tokens.splice(idx, 1);
};

module.exports = TokenStore;