/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const Router = require('./router');
const Executor = require('./executor');
const Request = require('./request');
const Response = require('./response');
const staticMiddleware = require('./middleware/static');
const authMiddleware = require('./middleware/auth');
const WSServer = require('./ws/WebSocketServer');

function App(server)
{
    this.port = null;
    this.server = server;
    this.staticRootDir = null;
    this.sockets = [];
    this.stores = [];
    this.router = new Router();
    this.executor = new Executor(function (func, p, next)
    {
        /// для стрелочных функций нельзя вызывать apply
        func(p[0], p[1], next)
    });

    server
        .on('listening', this.onListening.bind(this))
        .on('error', this.onError.bind(this))
        .on('close', this.onClose.bind(this))
        .on('request', this.onRequest.bind(this))
}

App.prototype.onError = function (e)
{
    if (e.code !== 'EADDRINUSE')
        throw e;

    console.log('[App] Address in use, retrying...');

    setTimeout(() =>
    {
        this.server.close();
        this.server.listen(this.port);
    }, 1000, this);
};

App.prototype.onListening = function ()
{
    console.log(`[App] Start listening on port ${this.port}`)
};

App.prototype.onClose = function ()
{
    console.log(`[App] Stop listening on port ${this.port}`)
};

App.prototype.onRequest = function (req, res)
{
    this.handleRequest(req, res);
};

App.prototype.start = function (port, onListening)
{
    if (onListening)
        this.server.once("listening", onListening);

    this.port = port;
    this.server.listen(port);
};

App.prototype.stop = function ()
{
    this.server.close();
    this.sockets.forEach(x => x.close());
    this.sockets = [];
};

App.prototype.handleRequest = function (req, res)
{
    let params = [new Request(req), new Response(res, this)];
    this.executor.exec(()=> console.log('chain handled'), params);
};

App.prototype.getStore = function (storeType)
{
    return this.stores.filter(x => x instanceof storeType)[0] || null;
};

App.prototype.use = function (middleware)
{
    this.executor.use(middleware);
    return this;
};

App.prototype.useRequestLogger = function ()
{
    return this.use((req, res, next) =>
    {
        console.log('[App]', req.method, req.url);
        next();
    });
};

App.prototype.useRouterAuth = function (path)
{
    return this.use(authMiddleware(path));
};

App.prototype.useRouter = function (routes)
{
    if (routes)
        this.router.register(routes);

    return this.use(this.router.build());
};

App.prototype.useNotFound = function ()
{
    return this.use((req, res, next) =>
    {
        res.notFound();
    });
};

App.prototype.useStatic = function (root, fileTypes)
{
    this.staticRootDir = root;
    return this.use(staticMiddleware(root, fileTypes));
};

App.prototype.useWS = function (path, handler)
{
    let server = this.server;
    let wss = new WSServer({path, server});
    wss.on('connection', con => handler(con, wss, this));
    this.sockets.push(wss);
    return this;
};

App.prototype.useStore = function (store)
{
    this.stores.push(store);
    return this;
};

module.exports = App;
