/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const HTTP_METHODS = require('./HTTP_METHODS');

function Router()
{
    this.routes = [];
}
Router.prototype.register = function (routes)
{
    routes.forEach(x => this.routes.push(x));
};

Router.prototype.use = function (path, handler, method)
{
    if (typeof path === 'undefined')
        throw new Error('Path is required');

    method = method || HTTP_METHODS.ALL;
    this.routes.push({method, path, handler});
};

Router.prototype.get = function (path, handler)
{
    this.use(HTTP_METHODS.GET, path, handler);
};

Router.prototype.all = function (path, handler)
{
    this.use(HTTP_METHODS.ALL, path, handler);
};

Router.prototype.post = function (path, handler)
{
    this.use(HTTP_METHODS.POST, path, handler);
};

Router.prototype.put = function (path, handler)
{
    this.use(HTTP_METHODS.PUT, path, handler);
};

Router.prototype.delete = function (path, handler)
{
    this.use(HTTP_METHODS.DELETE, path, handler);
};

Router.prototype.check = function (route, req)
{
    let url = req.url.toLowerCase().split("?")[0],
        method = req.method;

    if (method === route.method || route.method === HTTP_METHODS.ALL)
        return route.path instanceof RegExp ? route.path.test(url) : route.path === url;

    return false;
};

Router.prototype.getRoute = function (req)
{
    let routes = this.routes;

    for (let i = 0, l = routes.length; i < l; i++)
    {
        let route = routes[i];
        if (this.check(route, req))
            return route;
    }

    return null;
};

Router.prototype.build = function ()
{
    return (req, res, next) =>
    {
        let route = this.getRoute(req);
        if (route)
            route.handler(req, res, next);
        else
            next();
    };
};

module.exports = Router;


