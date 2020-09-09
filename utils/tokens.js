/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const crypto = require('crypto');
const app_secret = 'token-validation-app-secret';

function generateToken(user, createDate)
{
    return crypto.createHmac('sha512', app_secret)
                 .update(user.login + user.id + createDate.getTime())
                 .digest('base64');
}
function expiresIn(minutes)
{
    let date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}

function generate(user, lifetime)
{
    let expires = expiresIn(lifetime),
        createDate = new Date(),
        token = generateToken(user, createDate);

    return {user, token, expires, createDate};
}

function validate(token, user)
{
    return token.expires > Date.now() && generateToken(user, token.createDate) === token.token;
}

module.exports = {
    generate: generate,
    validate: validate
};