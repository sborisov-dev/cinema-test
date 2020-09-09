/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const HTTP_METHODS = require('../app/HTTP_METHODS');

module.exports = [
    {path: '/', method: HTTP_METHODS.GET, handler: require('./home/index')},
    {path: '/account/signin', method: HTTP_METHODS.POST, handler: require('./account/signin')},
    {path: '/account/signup', method: HTTP_METHODS.POST, handler: require('./account/signup')},
    {path: '/account/signout', method: HTTP_METHODS.POST, handler: require('./account/signout')},
    {path: '/account/check', method: HTTP_METHODS.POST, handler: require('./account/check')},
    {path: /\/api\/seance\/+(\d)$/i, method: HTTP_METHODS.GET, handler: require('./api/seance/byId')},
    {path: '/api/reserve', method: HTTP_METHODS.GET, handler: require('./api/reserve')},
];