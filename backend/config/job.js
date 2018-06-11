/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

const EmailService = require('../app/service/email.server.service')

const COUNT_ATTEMPT = 3 // Total de tentaivas

module.exports = function () {
    let emailService = new EmailService()
    emailService.resendEmail(COUNT_ATTEMPT)
};