/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';
var config = require('./config');
var nodemailer = require('nodemailer');

module.exports = function (options) {
    return nodemailer.createTransport(options);
};