/*!
 * Created by Sergey Borisov on 11.09.2016.
 */
"use strict";

const SeanceStore = require('../../../data/SeanceStore');

module.exports = function (req, res, next)
{
    let seanceStore = res.app.getStore(SeanceStore),
        its = req.url.split('/'),
        id = parseInt(its[its.length - 1], 10);

    id = isNaN(id) ? -1 : id;

    seanceStore.getById(id)
               .then(seance =>
               {
                   res.json({seance});
               })
};