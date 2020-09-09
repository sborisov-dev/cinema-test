/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

const crypto = require('crypto');
const promisify = require('./promisify');
const randomBytesAsync = promisify(crypto.randomBytes),
    pbkdf2Async = promisify(crypto.pbkdf2);

// https://gist.github.com/mba7/979e6c3fe715fc618549fae4d09019ef
// принцип везде один: создать соль и хэш => сложить => при валидации разложить и повторить хеширование
const CFG = {
    hashBytes: 64,
    saltBytes: 16,
    iterations: 500000,
    algo: 'sha512',
    encoding: 'base64'
};

function hashPassword(password)
{
    let salt;
    return randomBytesAsync(CFG.saltBytes)
        .then(random =>
        {
            salt = random;
            return pbkdf2Async(password, salt, CFG.iterations, CFG.hashBytes, CFG.algo)
        })
        .then(hash =>
        {
            let hashframe = new Buffer(hash.length + salt.length + 8);

            hashframe.writeUInt32BE(salt.length, 0, true);
            hashframe.writeUInt32BE(CFG.iterations, 4, true);
            salt.copy(hashframe, 8);
            hash.copy(hashframe, salt.length + 8);
            return hashframe.toString(CFG.encoding);
        });
}

function verifyPassword(password, hashframe)
{
    hashframe = new Buffer(hashframe, CFG.encoding);
    let saltBytes = hashframe.readUInt32BE(0);
    let hashBytes = hashframe.length - saltBytes - 8;
    let iterations = hashframe.readUInt32BE(4);
    let salt = hashframe.slice(8, saltBytes + 8);
    let hash = hashframe.slice(8 + saltBytes, saltBytes + hashBytes + 8);

    return pbkdf2Async(password, salt, iterations, hashBytes, CFG.algo)
        .then(verify => verify.equals(hash));
}

module.exports = {
    hash: hashPassword,
    verify: verifyPassword
};