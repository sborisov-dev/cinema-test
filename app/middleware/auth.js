/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const getUserAndValidToken = require('../../utils/getUserAndValidToken');

function AuthMiddleware(path)
{
    this.path = path;
}

AuthMiddleware.prototype.check = function (req)
{
    return this.path instanceof RegExp ? this.path.test(req.url) : req.url.toLowerCase() === this.path.toLowerCase();
};

AuthMiddleware.prototype.extractToken = function (req)
{
    return req.headers["x-access-token"];
};

AuthMiddleware.prototype.validate = function (req, res)
{
    let xAccessToken = this.extractToken(req);

    return getUserAndValidToken(xAccessToken, res.app)
        .then(data => data && data.token && data.user || false);
};

AuthMiddleware.prototype.exec = function (req, res, next)
{
    if (!this.check(req))
        return next();

    this.validate(req, res)
        .then(isAuth =>
        {

            if (!isAuth)
                res.unauthorized();
            else
                next();
        })
        .catch(e =>
        {
            console.error(e, e.stack);
            let errorMessage = "Упс. Возникла внутренняя ошибка сервер";
            res.sendError({errorMessage}, 500);
        });
};

module.exports = function (path)
{
    let handler = new AuthMiddleware(path);
    return (req, res, next) => handler.exec(req, res, next);
};