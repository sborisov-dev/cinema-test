/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const SeanceStore = require('../../../data/SeanceStore');
const getUserAndValidToken = require('../../../utils/getUserAndValidToken');

module.exports = function (req, res, next)
{
    let seanceStore = res.app.getStore(SeanceStore),
        id = 1,
        token = req.headers["x-access-token"];

    Promise.all([
        seanceStore.getById(id),
        getUserAndValidToken(token, res.app)
    ])
           .then(result =>
           {
               let seance = result[0],
                   data = result[1];
               let its = seance.getConfirmedByUser(data.user);
               res.json({its});
           });
};