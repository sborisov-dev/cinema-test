/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

"use strict";

const UserStore = require('../../data/UserStore');
const TokenStore = require('../../data/TokenStore');

module.exports = function (req, res, next)
{
    let userStore = res.app.getStore(UserStore),
        tokenStore = res.app.getStore(TokenStore);

    req.json()
       .then(body => userStore.createUser(body.login, body.password))
       .then(user =>
       {
           let color = user.color;
           let token = tokenStore.generate(user).token;
           let username = user.login;
           res.json({token, color, username});
       })
       .catch(e =>
       {
           console.error(e, e.stack);
           let errorMessage = e.message === 'UserAlreadyExists'
               ? "Учетная запись уже существует"
               : "Упс. Возникла внутренняя ошибка сервер";
           res.sendError({errorMessage}, 500);
       });
};