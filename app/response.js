/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const fs = require('fs');
const path = require('path');
const getContentType = require('../utils/getContentType');

function ResponseWrapper(res, app)
{
    this.app = app;
    this.res = res;
}

ResponseWrapper.prototype.notFound = function ()
{
    let res = this.res;
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Not Found');
    res.end();
};

ResponseWrapper.prototype.unauthorized = function ()
{
    this.sendError({errorMessage: "Unauthorized"}, 401)
};

ResponseWrapper.prototype.sendFile = function (pathname)
{
    if (!path.isAbsolute(pathname))
        pathname = path.join(this.app.staticRootDir, pathname);

    let fileStream = fs.createReadStream(pathname),
        res = this.res,
        contentType = getContentType(pathname);

    res.writeHead(200, {'Content-Type': contentType});
    fileStream.pipe(res);
};

ResponseWrapper.prototype.json = function (data)
{
    let res = this.res;
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
};

ResponseWrapper.prototype.sendError = function (error, statusCode)
{
    let res = this.res;
    res.writeHead(statusCode || 500, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(error));
    res.end();
};

module.exports = ResponseWrapper;