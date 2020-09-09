/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

function Executor(invoke)
{
    this.handlers = [];
    this.invoke = invoke || Executor.DEFAULT_INVOKE;
}

Executor.prototype.use = function (middleware)
{
    this.handlers.push(middleware);
};

Executor.prototype.exec = function (callback, params)
{
    this._exec(callback, params, 0);
};

Executor.prototype._exec = function (callback, params, idx)
{
    idx = idx || 0;
    let func = this.handlers[idx];

    if (!!func)
    {
        let next = () => this._exec(callback, params, idx + 1);

        try
        {
            this.invoke(func, params, next);
        }
        catch (e)
        {
            console.error(e, e.stack);
            return callback && callback();
        }
    }
    else
    {
        return callback && callback();
    }
};

Executor.DEFAULT_INVOKE = function (func, params, next)
{
    let p = [].concat(params, next);
    func.apply(null, p);
};

module.exports = Executor;