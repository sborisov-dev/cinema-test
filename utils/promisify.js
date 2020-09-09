/*!
 * Created by Sergey Borisov on 08.09.2016.
 */

"use strict";

module.exports = function (originalFunc)
{
    return function (...args)
    {
        return new Promise((resolve, reject)=>
        {
            originalFunc.apply(null, [].concat(args, (err, data)=>
            {
                if (err && err.stack)
                    reject(err);
                else
                    resolve(err || data);
            }));
        });
    }
};