/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

function RequestWrapper(req)
{
    this.req = req;
    Object.assign(this, req);
}

RequestWrapper.prototype.json = function ()
{
    return new Promise((resolve, reject) =>
    {
        let body = '',
            req = this.req;
        req.on('data', data => body += data);
        req.on('end', ()=>
        {
            try
            {
                let json = JSON.parse(body);
                resolve(json);
            }
            catch (e)
            {
                reject(e);
            }
        });
    })
};
module.exports = RequestWrapper;