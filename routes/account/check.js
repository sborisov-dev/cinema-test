/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const getUserAndValidToken = require('../../utils/getUserAndValidToken');

module.exports = function (req, res, next)
{
    req.json()
       .then(body =>
       {
           return getUserAndValidToken(body.token, res.app)
       })
       .then(data =>
       {
           res.json({isAuthenticated: data && data.token && data.user || false});
       })
       .catch(e =>
       {
           console.error(e, e.stack);
           let errorMessage = "Упс. Возникла внутренняя ошибка сервер";
           res.sendError({errorMessage}, 500);
       });
};