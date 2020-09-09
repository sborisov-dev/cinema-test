/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const promisify = require('../../utils/promisify');
const fs = require('fs');
const path = require('path');
const exists = promisify(fs.exists);

function StaticMiddleware(root, fileTypes)
{
    this.root = root;
    this.fileTypes = fileTypes || StaticMiddleware.DEFAULT_FILETYPES;
}

StaticMiddleware.DEFAULT_FILETYPES = /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico|css|html|json|xml|csv|txt|js)$/;

StaticMiddleware.prototype.merge = function (pathname)
{
    return path.join(this.root, pathname);
};

StaticMiddleware.prototype.check = function (pathname)
{
    return this.fileTypes.test(pathname);
};

StaticMiddleware.prototype.exists = function (pathname)
{
    return exists(pathname);
};

StaticMiddleware.prototype.exec = function (req, res, next)
{
    let pathname = this.merge(req.url);

    if (!this.check(pathname))
        return next();

    this.exists(pathname)
        .then(isExist =>
        {
            if (!isExist)
                next();
            else
                res.sendFile(pathname);
        })
        .catch(e =>
        {
            console.error(e, e.stack);
            next();
        });
};

module.exports = function (root, fileTypes)
{
    let handler = new StaticMiddleware(root, fileTypes);
    return (req, res, next) => handler.exec(req, res, next);
};