/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const inherits = require('util').inherits;
const EventEmitter = require('events');
const FrameFactory = require('./FrameFactory');
const Frame = require('./Frame');
const Opcodes = require('./Opcode');
const CloseCodes = require('./WebSocketCodes');

const ConnectionState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

function WebSocketConnection(socket, server)
{
    EventEmitter.call(this);
    this.socket = socket;
    this.server = server;
    this.buffer = new Buffer(0);
    this.textBuffer = null;
    this.readyState = ConnectionState.OPEN;
    this.bindEvents();
}
inherits(WebSocketConnection, EventEmitter);
WebSocketConnection.MAX_BUFFER_LENGTH = 2 * 1024 * 1024; // 2Mb

WebSocketConnection.prototype.bindEvents = function ()
{
    this.socket
        .on('data', data => this.read(data))
        .on('error', e => this.emit('error', e))
        .once('close', ()=> this.onClose())
        .once('finish', ()=> this.onClose());
};

WebSocketConnection.prototype.onClose = function ()
{
    if (this.readyState === ConnectionState.CONNECTING || this.readyState === ConnectionState.OPEN)
        this.emit('close', CloseCodes.CLOSE_ABNORMAL, '');
    this.textBuffer = null;
    this.readyState = ConnectionState.CLOSED;
};

WebSocketConnection.prototype.sendText = function (str, callback)
{
    if (this.readyState !== ConnectionState.OPEN)
        return this.emit('error', new Error('Connection is closed'));

    let frame = FrameFactory.createTextFrame(str);
    this.socket.write(frame.toBuffer(), callback);
};

WebSocketConnection.prototype.send = function (data, callback)
{
    //todo implement sendBinary;

    if (typeof data !== 'string')
        throw new TypeError('data should be a string');

    this.sendText(data, callback);
};

WebSocketConnection.prototype.ping = function (data)
{
    if (this.readyState !== ConnectionState.OPEN)
        return this.emit('error', new Error('Connection closed'));

    let frame = FrameFactory.createPingFrame(data || '');
    return this.socket.write(frame.toBuffer());
};

WebSocketConnection.prototype.close = function (code, reason)
{
    if (this.readyState === ConnectionState.OPEN)
    {
        let frame = FrameFactory.createCloseFrame(code, reason);
        this.socket.write(frame.toBuffer());
        this.readyState = ConnectionState.CLOSING;
    }
    else if (this.readyState !== ConnectionState.CLOSED)
    {
        this.socket.end();
        this.readyState = ConnectionState.CLOSED;
    }
    this.emit('close', code, reason)
};

WebSocketConnection.prototype.read = function (buffer)
{
    if (this.readyState === ConnectionState.CLOSED || !buffer)
        return;

    // сохраняем в локальный буфер
    this.buffer = Buffer.concat([this.buffer, buffer], this.buffer.length + buffer.length);

    //читаем данные фрейма
    let temp;
    while ((temp = this.readFrame()) === true)
    { }

    if (temp === false)
        this.close(CloseCodes.CLOSE_PROTOCOL_ERROR);
    else if (this.buffer.length > WebSocketConnection.MAX_BUFFER_LENGTH)
        this.close(CloseCodes.CLOSE_TOO_LARGE);
};

//region frames
WebSocketConnection.prototype.readFrame = function ()
{
    if (this.buffer.length < 2)
        return;

    let frame = Frame.fromBuffer(this.buffer);

    if (!frame)
        return;

    if (!frame.isValid)
        return this.buffer.length < frame.contentIndex + frame.contentLength ? undefined : false;

    this.buffer = this.buffer.slice(frame.contentIndex + frame.contentLength);
    return this.processFrame(frame);
};

WebSocketConnection.prototype.processFrame = function (frame)
{
    // обработка управляющих фреймов
    switch (frame.opcode)
    {
        case Opcodes.Close:
            this.processCloseFrame(frame);
            return true;
            break;

        case Opcodes.Ping:
            this.processPingFrame(frame);
            return true;
            break;

        case Opcodes.Pong:
            this.processPongFrame(frame);
            return true;
            break;
    }

    // если коннект закрыт то игнорим
    if (this.readyState !== ConnectionState.OPEN)
        return true;

    // обработка фреймов данных
    switch (frame.opcode)
    {
        case Opcodes.Text:
            this.processTextFrame(frame);
            return true;
            break;

        case Opcodes.Binary:
            //TODO: implement binary
            //this.emit('error', new Error('Binary frames is not implemented'));
            return false;
            break;
    }

    return true;
};

WebSocketConnection.prototype.processCloseFrame = function (frame)
{
    switch (this.readyState)
    {
        case ConnectionState.CLOSING:
            this.socket.end();
            break;
        case ConnectionState.OPEN:
            let code, reason;
            if (frame.payload.length >= 2)
            {
                code = frame.payload.readUInt16BE(0);
                reason = frame.payload.slice(2).toString();
            }
            else
            {
                code = CloseCodes.CLOSE_NO_STATUS;
                reason = '';
            }
            let close = FrameFactory.createCloseFrame(code, reason);
            this.socket.write(close.toBuffer());
            this.readyState = ConnectionState.CLOSED;
            this.emit('close', code, reason);
            break;
    }
};

WebSocketConnection.prototype.processPingFrame = function (frame)
{
    if (this.readyState === ConnectionState.OPEN)
    {
        let pong = FrameFactory.createPongFrame(frame.payload.toString());
        this.socket.write(pong.toBuffer());
    }
};

WebSocketConnection.prototype.processPongFrame = function (frame)
{
    this.emit('pong', frame.payload.toString());
};

WebSocketConnection.prototype.processTextFrame = function (frame)
{
    let text = frame.payload.toString();
    this.textBuffer = this.textBuffer ? this.textBuffer + text : text;

    if (frame.fin)
    {
        this.emit('message', this.textBuffer);
        this.textBuffer = null;
    }
};

//endregion

module.exports = WebSocketConnection;
