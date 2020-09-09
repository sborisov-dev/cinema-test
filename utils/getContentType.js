/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const path = require('path');

const ContentTypes = {
    png: "image/png",
    jpe: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/vnd.microsoft.icon",
    css: "text/css",
    html: "text/html",
    json: "application/json",
    xml: "text/xml",
    csv: "text/csv",
    txt: "text/plain",
    js: "application/javascript",
    DEFAULT: "application/octet-stream"
};

module.exports = function (pathname)
{
    let ext = path.extname(pathname);
    if (ext.indexOf(".") === 0)
        ext = ext.substr(1, ext.length - 1);

    return ContentTypes[ext.toLowerCase()] || ContentTypes.DEFAULT;
};
