/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const Opcodes = require('./Opcode');
const Frame = require('./Frame');

function FrameFactory()
{

}

FrameFactory.createTextFrame = function (data, isMasked)
{
    let payload = new Buffer(data),
        fin = true,
        opcode = Opcodes.Text;

    return new Frame({fin, opcode, isMasked, payload});
};

FrameFactory.createPingFrame = function (data, isMasked)
{
    let payload = new Buffer(data),
        fin = true,
        opcode = Opcodes.Ping;

    return new Frame({fin, opcode, isMasked, payload});
};

FrameFactory.createPongFrame = function (data, isMasked)
{
    let payload = new Buffer(data),
        fin = true,
        opcode = Opcodes.Pong;

    return new Frame({fin, opcode, isMasked, payload});
};

FrameFactory.createCloseFrame = function (closeCode, reason, isMasked)
{
    let payload,
        fin = true,
        opcode = Opcodes.Close;

    if (closeCode)
    {
        payload = new Buffer(!reason ? '--' : '--' + reason);
        payload.writeUInt16BE(closeCode, 0)
    }
    else
        payload = new Buffer(0);

    return new Frame({fin, opcode, isMasked, payload});
};

module.exports = FrameFactory;