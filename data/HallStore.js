/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const Hall = require('../models/Hall');
const BaseStore = require('./BaseStore');
const inherits = require('util').inherits;

function HallStore()
{
    BaseStore.call(this);
}
inherits(HallStore, BaseStore);

HallStore.prototype.create = function (name, structure)
{
    let hall = new Hall({name, structure});
    this.items.push(hall);
    return hall;
};

module.exports = HallStore;