/*!
 * Created by Sergey Borisov on 09.09.2016.
 */
"use strict";
const getUserAndValidToken = require('../../utils/getUserAndValidToken');
const SeanceStore = require('../../data/SeanceStore');

function notifyAll(server, excludeConnection, data)
{
    let conId = excludeConnection && excludeConnection.id;

    server.connections.forEach(x=>
    {
        if (x.id !== conId)
            try
            {
                x.send(data);
            }
            catch (e)
            {}
    });
}

function processReserve(ctx)
{
    let server = ctx.server,
        user = ctx.user,
        action = ctx.action,
        seance = ctx.seance;

    let r = seance.reserve(user, action.data.row, action.data.place);
    if (r)
        notifyAll(server, null, JSON.stringify({
            type: 'reserve',
            data: {
                color: r.color,
                confirmed: r.confirmed,
                row: r.row,
                place: r.place
            }
        }));
}
function processUnreserve(ctx)
{
    let server = ctx.server,
        user = ctx.user,
        action = ctx.action,
        seance = ctx.seance;

    let r = seance.unreserve(user, action.data.row, action.data.place);

    if (r)
        notifyAll(server, null, JSON.stringify({
            type: 'unreserve',
            data: {
                color: r.color,
                confirmed: r.confirmed,
                row: r.row,
                place: r.place
            }
        }));
}
function processConfirm(ctx)
{
    let server = ctx.server,
        user = ctx.user,
        action = ctx.action,
        seance = ctx.seance,
        connection = ctx.connection;

    let its = seance.confirm(user);
    if (its.length)
        notifyAll(server, connection, JSON.stringify({
            type: 'confirmed',
            data: its
        }));

    try
    {
        connection.send(JSON.stringify({type: 'confirmsuccess'}))
    }
    catch (e)
    {}
}

let intervalId,
    intervalId2;

module.exports = function (connection, server, app)
{
    let seance;
    //region чистим мусор, через 1.5 минуты выбранные места снимаются с резерва. Можно придумать механизмы и
    // получше, но для теста хватит такой функции
    if (!intervalId)
        intervalId = setInterval(() =>
        {
            if (!seance || !server.connections.length)
                return;

            let its = seance.getNotActual();
            its.forEach(r =>
            {
                seance.removeReserve(r);
                notifyAll(server, null, JSON.stringify({
                    type: 'unreserve',
                    data: {
                        color: r.color,
                        confirmed: r.confirmed,
                        row: r.row,
                        place: r.place
                    }
                }));
            });
        }, 10000);
    if (!intervalId2)
        intervalId2 = setInterval(() =>
        {
            if (!seance || !server.connections.length)
                return;

            let its = seance.getNotActualConfirmed();
            its.forEach(r =>
            {
                seance.removeReserve(r);
                notifyAll(server, null, JSON.stringify({
                    type: 'unreserve',
                    data: {
                        color: r.color,
                        confirmed: r.confirmed,
                        row: r.row,
                        place: r.place
                    }
                }));
            });
        }, 5 * 60 * 1000);
    //endregion

    connection.on('message', text =>
    {
        let actions = JSON.parse(text),
            action = actions[0],
            seanceStore = app.getStore(SeanceStore);

        Promise.all([
            getUserAndValidToken(action.accessToken, app),
            seanceStore.getById(1)
        ])
               .then(result =>
               {
                   let user = result[0] && result[0].user;
                   seance = result[1];

                   if (!user) return;

                   let ctx = {action, user, server, seance, connection};

                   switch (action.type)
                   {
                       case 'reserve':
                           processReserve(ctx);
                           break;
                       case 'unreserve':
                           processUnreserve(ctx);
                           break;
                       case 'confirm':
                           processConfirm(ctx);
                           break;
                   }
               })
               .catch(e => console.error(e, e.stack));
    });
};