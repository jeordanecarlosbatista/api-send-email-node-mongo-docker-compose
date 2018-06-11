/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

let Log = require('mongoose').model('Log');

module.exports.getAll = function (req, res, next) {
    Log.find({}, function (err, docs) {
        if (!err)
            res.json(docs);
        else
            next(err);
    });
};