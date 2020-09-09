/*!
 * Created by Sergey Borisov on 09.09.2016.
 */
"use strict";

// уф... https://learn.javascript.ru/websockets#формат-данных
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers

const Opcodes = require('./Opcode');

function Frame(opts)
{
    this.fin = opts.fin || true;
    this.opcode = opts.opcode;
    this.isMasked = opts.isMasked || false;
    this.payload = opts.payload || null;
    this.contentLength = opts.contentLength || opts.payload && opts.payload.length || -1;
    this.contentIndex = opts.contentIndex || -1;
    this.isValid = this.validate();
}

Frame.fromBuffer = function (buffer)
{
    if (buffer.length < 2)
        return null;

    let firstByte = buffer[0],
        secondByte = buffer[1],
        fin = Frame.extractFin(firstByte),
        opcode = Frame.extractOpcode(firstByte),
        isMasked = Frame.extractIsMasked(secondByte),
        data = Frame.extractPayload(secondByte, buffer, isMasked),
        contentLength = data && data.contentLength || null,
        contentIndex = data && data.contentIndex || null,
        payload = data && data.payload || null;

    let frame = new Frame({fin, opcode, isMasked, payload, contentLength, contentIndex});
    return frame.isValid ? frame : null;
};

//region helpers
Frame.extractFin = function (byte)
{
    let HB = byte >> 4;

    if (HB % 8)
        return null; // биты RSV1, RSV2 и RSV3 должны быть нулевым

    return HB === 8;
};

Frame.extractOpcode = function (byte)
{
    let opcode = byte % 16;

    if (opcode !== Opcodes.Text && opcode !== Opcodes.Binary && opcode !== Opcodes.Close &&
        opcode !== Opcodes.Next && opcode !== Opcodes.Ping && opcode !== Opcodes.Pong)
        return null; // некорректный opcode
    return opcode;
};

Frame.extractIsMasked = function (byte)
{
    let isMasked = byte >> 7;
    return !!isMasked;
};

Frame.extractPayload = function (byte, buffer, isMasked)
{
    let len = byte % 128,
        start = isMasked ? 6 : 2;

    if (buffer.length < start + len)
        return {
            payload: null,
            contentLength: len,
            contentIndex: start
        }; // что-то не хватает данных

    if (len === 126)
    {
        len = buffer.readUInt16BE(2);
        start += 2
    }
    else if (len === 127)
    {
        len = buffer.readUInt32BE(2) * Math.pow(2, 32) + buffer.readUInt32BE(6);
        start += 8;
    }

    if (buffer.length < start + len)
        return {
            payload: null,
            contentLength: len,
            contentIndex: start
        }; // что-то не хватает данных

    let payload = buffer.slice(start, start + len);
    if (isMasked)
    {
        let mask = buffer.slice(start - 4, start);
        for (let i = 0; i < payload.length; i++)
            payload[i] ^= mask[i % 4];
    }

    return {
        payload: payload,
        contentLength: len,
        contentIndex: start
    };
};
//endregion

Frame.prototype.validate = function ()
{
    return this.fin !== null &&
        this.opcode !== null && !(this.opcode >= Opcodes.Close && !this.fin) && // эти фреймы фрагментировать нельзя
        !!this.payload;
};

Frame.prototype.getMetaBuffer = function ()
{
    let len = this.payload.length,
        meta = new Buffer(2 + (len < 126 ? 0 : (len < 65536 ? 2 : 8)) + (this.isMasked ? 4 : 0)),
        start, mask, i;

    meta[0] = (this.fin ? 0x80 : 0) + this.opcode;
    meta[1] = this.isMasked ? 0x80 : 0;

    start = 2;
    if (len < 126)
    {
        meta[1] += len
    }
    else if (len < 65536)
    {
        meta[1] += 126;
        meta.writeUInt16BE(len, 2);
        start += 2
    }
    else
    {
        meta[1] += 127;
        meta.writeUInt32BE(Math.floor(len / Math.pow(2, 32)), 2);
        meta.writeUInt32BE(len % Math.pow(2, 32), 6);
        start += 8
    }

    if (this.isMasked)
    {
        mask = new Buffer(4);
        for (i = 0; i < 4; i++)
            meta[start + i] = mask[i] = Math.floor(Math.random() * 256);

        for (i = 0; i < this.payload.length; i++)
            this.payload[i] ^= mask[i % 4]
    }

    return meta;
};

Frame.prototype.toBuffer = function ()
{
    if (!this.isValid)
        return null;

    let meta = this.getMetaBuffer(),
        data = this.payload;

    return Buffer.concat([meta, data], meta.length + data.length);
};

module.exports = Frame;