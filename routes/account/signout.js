/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

"use strict";

const TokenStore = require('../../data/TokenStore');

module.exports = function (req, res, next)
{
    let tokenStore = res.app.getStore(TokenStore);

    req.json()
       .then(body =>
       {
           tokenStore.remove(body.token);
           res.json({success: true});
       })
       .catch(e =>
       {
           console.error(e, e.stack);
           let errorMessage = "Упс. Возникла внутренняя ошибка сервер";
           res.sendError({errorMessage}, 500);
       });
};