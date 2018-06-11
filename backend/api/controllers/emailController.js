/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

let auth = require("../helpers/auth");
let EmailService = require('../../app/service/email.server.service')

module.exports.postEmail = function (req, res, next) {
    let emailService = new EmailService()
    emailService.postEmail(req, res)
};

module.exports.getAllEmails = function (req, res, next) {
    let emailService = new EmailService()
    emailService.getAll(req, res)
};