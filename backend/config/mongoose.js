/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function () {
    //TODO check if this really works with bluebird
    mongoose.Promise = global.Promise;
    var db = mongoose.connect(config.db, { promiseLibrary: require('bluebird'), useMongoClient: true });

    //register models and schemas
    require('../app/models/email.server.model');
    require('../app/models/log.server.model');

    return db;
};