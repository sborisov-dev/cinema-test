/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const util = require('util');
const url = require('url');
const EventEmitter = require('events');
const WebSocketConnection = require('./WebSocketConnection');
const crypto = require("crypto");

let IDS = 0;

function WebSocketServer(opts)
{
    EventEmitter.call(this);
    this.path = opts.path || "/";
    this.server = opts.server;
    this.connections = [];
    this.initialize();
}
util.inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.initialize = function ()
{
    let server = this.server;
    server.__webSocketsPaths = server.__webSocketsPaths || {};
    if (server.__webSocketsPaths[this.path])
        throw new Error("The path is already in use");
    server.__webSocketsPaths[this.path] = true;

    server
        .on("upgrade", (req, socket, head) => this.onUpgrade(req, socket, head))
        .on("error", (err) => this.onError(err))
        .on("close", () => this.onClose());
};

WebSocketServer.prototype.onClose = function ()
{
    this.close();
};

WebSocketServer.prototype.onUpgrade = function (req, socket)
{
    let parsedUrl = url.parse(req.url);
    if (parsedUrl && parsedUrl.pathname === this.path)
        this.handleUpgrade(req, socket);
};

WebSocketServer.prototype.onError = function (ex)
{
    this.emit('error', ex);
};

WebSocketServer.prototype.addConnection = function (socket)
{
    let connection = new WebSocketConnection(socket, this);
    connection.id = ++IDS;
    console.log(`add connection #${connection.id} on path ${this.path}`);
    this.connections.push(connection);
    return connection;
};

WebSocketServer.prototype.removeConnection = function (connection)
{
    console.log(`remove connection #${connection.id} on path ${this.path}`);
    let idx = this.connections.push(connection);
    if (idx > -1)
        this.connections.splice(idx, 1);
};

WebSocketServer.prototype.close = function ()
{
    delete this.server.__webSocketsPaths[this.path];
    this.connections.forEach(x => x.close());
    this.connections = [];
    this.server = null;
    this.emit('close');
};

WebSocketServer.prototype.handleUpgrade = function (req, socket)
{
    let errorHandler = () =>
    {
        try
        { socket.destroy(); }
        catch (e)
        {}
    };
    socket.on('error', errorHandler);

    let key = req.headers['sec-websocket-key'],
        version = parseInt(req.headers['sec-websocket-version'], 10);

    if (!key || version !== 13)
        return this.abortConnection(socket, 400, 'Bad Request');

    socket.setTimeout(0);
    socket.setNoDelay(true);
    try
    {
        socket.write(this.getHeaders(key));
    }
    catch (e)
    {
        errorHandler();
        return;
    }
    socket.removeListener('error', errorHandler);

    let connection = this.addConnection(socket);
    connection.on("close", () => this.removeConnection(connection));
    this.emit('connection', connection, this);
};

WebSocketServer.prototype.getHeaders = function (key)
{
    let hash = crypto.createHash('sha1')
                     .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
                     .digest('base64');

    let headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + hash,
        '',
        ''
    ];
    return headers.join('\r\n')
};

WebSocketServer.prototype.abortConnection = function (socket, code, name)
{
    try
    {
        let response = `HTTP/1.1 ${code} ${name}\r\n` +
            `Content-type: text/html\r\n` +
            `\r\n\r\n`;
        socket.write(response);
    }
    finally
    {
        try
        { socket.destroy(); }
        catch (e)
        {}
    }
};

module.exports = WebSocketServer;
