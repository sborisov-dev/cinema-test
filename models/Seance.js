/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

let GLOBAL_SEANCE_ID = 0;
const RESERVE_LIFETIME = 90 * 1000;
const RESERVE_USER_LIMIT = 5;
function Seance(opts)
{
    this.id = opts.id || ++GLOBAL_SEANCE_ID;
    this.hall = opts.hall;
    this.reservations = [];
}

Seance.prototype.check = function (user, row, place)
{
    let struct = this.hall.structure;
    return struct && struct[row] && struct[row][place] && !this.isReserved(row, place) && this.getAllByUser(user).length < RESERVE_USER_LIMIT;
};

Seance.prototype.isReserved = function (row, place)
{
    return !!this.reservations.filter(x => x.row === row && x.place === place)[0];
};

Seance.prototype.reserve = function (user, row, place)
{
    if (this.check(user, row, place))
        return this.addReserve(user, row, place);

    return null;
};

Seance.prototype.unreserve = function (user, row, place)
{
    let reserve = this.getReserve(user, row, place);
    return this.removeReserve(reserve) ? reserve : null;
};

Seance.prototype.confirm = function (user)
{
    return this.getAllByUser(user).map(x =>
    {
        x.confirmed = true;
        return x;
    });
};

Seance.prototype.addReserve = function (user, row, place)
{
    let userId = user.id,
        color = user.color,
        confirmed = false,
        createDate = Date.now(),
        reserve = {userId, color, confirmed, row, place, createDate};

    this.reservations.push(reserve);
    return reserve;
};

Seance.prototype.removeReserve = function (reserve)
{
    let idx = this.reservations.indexOf(reserve);

    if (idx > -1)
        this.reservations.splice(idx, 1);
    return idx > -1;
};

Seance.prototype.getReserve = function (user, row, place)
{
    let userId = user.id;

    return this.reservations.filter(x => x.userId === userId && x.row === row && x.place === place)[0] || null;
};

Seance.prototype.getAllByUser = function (user)
{
    let userId = user.id;
    return this.reservations.filter(x => x.userId === userId)
};

Seance.prototype.getConfirmedByUser = function (user)
{
    let userId = user.id;
    return this.reservations.filter(x => x.userId === userId && x.confirmed)
};

Seance.prototype.getNotActual = function ()
{
    let now = Date.now();
    return this.reservations.filter(x => !x.confirmed && now - x.createDate > RESERVE_LIFETIME);
};

Seance.prototype.getNotActualConfirmed = function ()
{
    let now = Date.now();
    return this.reservations.filter(x => !!x.confirmed && now - x.createDate > RESERVE_LIFETIME);
};

Seance.prototype.toJSON = function ()
{
    return {
        id: this.id,
        hall: this.hall,
        reservations: this.reservations.map(x =>
        {
            return {
                color: x.color,
                confirmed: x.confirmed,
                row: x.row,
                place: x.place
            };
        })
    }
};

module.exports = Seance;
