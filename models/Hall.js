/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

let GLOBAL_HALL_ID = 0;

function Hall(opts)
{
    this.id = opts.id || ++GLOBAL_HALL_ID;
    this.name = opts.name || 'Кинозал №' + this.id;
    this.structure = opts.structure || Hall.DEFAULT_HALL_STRUCTURE;
}

Hall.DEFAULT_HALL_STRUCTURE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]
];

module.exports = Hall;
