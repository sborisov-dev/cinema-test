/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

function BaseStore()
{
    this.items = [];
}

BaseStore.prototype.getById = function (id)
{
    if (!id)
        return Promise.resolve(null);

    let it = this.items.filter(x => x.id === id)[0] || null;
    return Promise.resolve(it);
};

module.exports = BaseStore;