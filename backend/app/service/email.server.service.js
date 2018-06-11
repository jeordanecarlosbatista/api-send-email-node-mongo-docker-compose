'use strict';

const NodemailerService = require('./nodemailer.service')
const LogService = require('./log.server.service')

const mongoose = require('../../config/mongoose')
const Email = require('mongoose').model('Email')
const Log = require('mongoose').model('Log')

class EmailService {
    constructor() {
        this.nodemailerService = new NodemailerService()
        this.logService = new LogService()
    }

    async postEmail(req, res) {
        let validate = this.validateParamAPIPOSTEmail(req.body, req.headers)

        if (validate.body.length > 0 || validate.header.length > 0) {
            res.status(400).json({ isErro: true, reason: "required", parameters: validate });
        }
        else {
            let emailSMTPConfig = {}
            emailSMTPConfig.host = req.headers['smtp_host']
            emailSMTPConfig.port = req.headers['smtp_port']
            emailSMTPConfig.requireTLS = req.headers['smtp_require_tls'] === "false" ? 0 : req.headers['smtp_require_tls'] === "true" ? 1 : 0
            emailSMTPConfig.tls = {}
            emailSMTPConfig.tls.rejectUnauthorized = req.headers['smtp_reject_unauthorized'] === "false" ? 0 : req.headers['smtp_reject_unauthorized'] === "true" ? 1 : 0
            emailSMTPConfig.auth = {}
            emailSMTPConfig.auth.user = req.headers['smtp_auth_user']
            emailSMTPConfig.auth.pass = req.headers['smtp_auth_pass']

            let mail = req.body
            let emailConfig = {}
            emailConfig.from = mail['from']
            emailConfig.to = mail['to']
            emailConfig.subject = mail['subject']
            emailConfig.text = mail['text']
            emailConfig.html = mail['html']

            try {
                await this.nodemailerService.sendEmail(emailConfig, emailSMTPConfig)
                res.status(200).json({ isErro: false, message: 'Email was forwarded.' });
            }
            catch (err) {
                let email = new Email()
                email.from = emailConfig.from
                email.to = emailConfig.from
                email.subject = emailConfig.from
                email.text = emailConfig.from
                email.html = emailConfig.from
                email.attempt = 1
                email.smtp.host = emailSMTPConfig.host
                email.smtp.port = emailSMTPConfig.port
                email.smtp.require_tls = emailSMTPConfig.requireTLS
                email.smtp.reject_unauthorized = emailSMTPConfig.tls.rejectUnauthorized
                email.smtp.auth_user = emailSMTPConfig.auth.user
                email.smtp.auth_pass = emailSMTPConfig.auth.pass

                let log = new Log()
                log.descricao = err.message
                log.type = 'Envio'
                log.idEmail = email._id

                try {
                    await this.saveEmail(email)
                    await this.logService.saveLog(log)
                    res.status(400).json({ isErro: true, message: 'internal error' });
                }
                catch (err) {
                    res.status(400).json({ message: err.message });
                }
            }
        }
    }

    async getAllEmails(req, res) {
        try {
            let docs = await this.findAllEmail()
            res.status(200).json(docs)
        }
        catch (err) {
            next(err)
        }
    }

    async getAll(req, res) {
        try {
            let docs = await this.findAllEmail()
            res.status(200).json(docs)
        }
        catch (err) {
            next(err)
        }
    }

    async saveEmail(model) {
        return new Promise((resolve, reject) => {
            mongoose().on('connected', function () {
                model.save().then((doc) => {
                    resolve(doc)
                }, error => {
                    reject(error)
                })
            }).on('disconnected', function () {
                reject("Erro ao abrir conexão com o banco de dados");
            });
        })
    }

    async updateEmail(emailModel) {
        return new Promise((resolve, reject) => {
            mongoose().on('connected', function () {
                Email.findById(emailModel._id, function (err, email) {
                    if (err) return handleError(err);
                    email.attempt = emailModel.attempt + 1
                    email.save(function (err, updatedEmail) {
                        if (!err) {
                            resolve()
                        } else { reject(err) }
                    });
                });
            }).on('disconnected', function () {
                reject("Erro ao abrir conexão com o banco de dados");
            });
        })
    }

    async deleteEmailById(id) {
        return new Promise((resolve, reject) => {
            Email.remove({ _id: id }, function (err) {
                if (!err) {
                    resolve()
                } else { reject(err) }
            });
        })
    }

    async findAllEmail() {
        return new Promise((resolve, reject) => {
            Email.find({}, function (err, object) {
                if (!err) {
                    resolve(object)
                } else { reject(err) }
            });
        })
    }

    async findAllEmailByAttent(count) {
        return new Promise((resolve, reject) => {
            const query = Email.find();
            let result = query.$where(`this.attempt <= ${count}`)
            resolve(result)
        })
    }

    async findEmailById(id) {
        return new Promise((resolve, reject) => {
            Email.findById({ _id: id }, function (err, object) {
                if (!err) {
                    resolve(object)
                } else { reject(err) }
            });
        })
    }

    async resendEmail(attempt) {
        try {
            let docs = await this.findAllEmailByAttent(attempt)
            for (let doc of docs) {
                try {
                    let emailConfig = {}
                    emailConfig.from = doc.from
                    emailConfig.to = doc.to
                    emailConfig.subject = doc.subject
                    emailConfig.text = doc.text
                    emailConfig.html = doc.html

                    let smtpConfig = {}
                    smtpConfig.host = doc.smtp.host
                    smtpConfig.port = doc.smtp.port
                    smtpConfig.requireTLS = doc.smtp.require_tls
                    smtpConfig.tls = {}
                    smtpConfig.tls.rejectUnauthorized = doc.smtp.reject_unauthorized
                    smtpConfig.auth = {}
                    smtpConfig.auth.user = doc.smtp.auth_user
                    smtpConfig.auth.pass = doc.smtp.auth_pass

                    await this.nodemailerService.sendEmail(emailConfig, smtpConfig)
                    await this.deleteEmailById(doc._id)
                }
                catch (err) {
                    await this.updateEmail(doc)
                    let log = new Log(err)
                    log.descricao = err.message
                    log.type = 'Reenvio'
                    log.idEmail = doc._id
                    await this.logService.saveLog(log)
                }
            }
        } catch (err) {
            let log = new Log(err)
            log.descricao = err.message
            log.type = 'Reenvio'
            await this.logService.saveLog(log)
        }
    }

    validateParamAPIPOSTEmail(body, headers) {
        let fieldsBody = []
        let fieldsHeader = []
        if (!body.from)
            fieldsBody.push('from')
        if (!body.to)
            if (!Array.isArray(body.to))
                fieldsBody.push('to')
        if (!body.subject)
            fieldsBody.push('subject')
        if (!body.text)
            fieldsBody.push('text')
        if (!body.html)
            fieldsBody.push('html')

        if (!headers.smtp_host)
            fieldsHeader.push('smtp_host')
        if (!headers.smtp_port)
            fieldsHeader.push('smtp_port')
        if (!headers.smtp_require_tls)
            fieldsHeader.push('smtp_require_tls')
        if (!headers.smtp_reject_unauthorized)
            fieldsHeader.push('smtp_reject_unauthorized')
        if (!headers.smtp_auth_user)
            fieldsHeader.push('smtp_auth_user')
        if (!headers.smtp_auth_pass)
            fieldsHeader.push('smtp_auth_pass')

        return { body: fieldsBody, header: fieldsHeader }
    }
}

module.exports = EmailService;