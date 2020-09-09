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

    let body, user;
    req.json()
       .then(jsonBody =>
       {
           body = jsonBody;
           return userStore.getByLogin(body.login);
       })
       .then(u =>
       {
           user = u;
           if (!user)
               throw new Error('InvalidLoginPassword');

           return user.verifyPassword(body.password);
       })
       .then(isValidPassword =>
       {
           if (!isValidPassword)
               throw new Error('InvalidLoginPassword');

           let color = user.color;
           let token = tokenStore.generate(user).token;
           let username = user.login;
           res.json({token, color, username});
       })
       .catch(e =>
       {
           console.error(e, e.stack);
           let errorMessage = e.message === 'InvalidLoginPassword'
               ? "Некорректный логин\\пароль"
               : "Упс. Возникла внутренняя ошибка сервер";
           res.sendError({errorMessage}, 401);
       });
};