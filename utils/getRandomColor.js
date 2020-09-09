/*!
 * Created by Sergey Borisov on 10.09.2016.
 */
"use strict";

function getRandomInteger(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = function ()
{
    let r = getRandomInteger(0, 255),
        g = getRandomInteger(0, 255),
        b = getRandomInteger(0, 255);

    return `rgb(${r},${g},${b})`;
};
