/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const Seance = require('../models/Seance');
const BaseStore = require('./BaseStore');
const inherits = require('util').inherits;

function SeanceStore()
{
    BaseStore.call(this);
}
inherits(SeanceStore, BaseStore);

SeanceStore.prototype.create = function (hall)
{
    let seance = new Seance({hall});
    this.items.push(seance);
    return seance;
};

module.exports = SeanceStore;