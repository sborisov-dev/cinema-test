/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
'use strict';

const http = require('http');
const App = require('../app/app');

module.exports.start = function (port)
{
    let server = http.createServer(),
        app = new App(server);

    app.start(port);
    return app;
};