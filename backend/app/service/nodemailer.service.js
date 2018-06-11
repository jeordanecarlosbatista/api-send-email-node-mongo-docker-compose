const nodemailer = require('../../config/nodemail');


class NodemailerService {
    constructor() { }

    async sendEmail(mailOptions, smtpOptions) {
        return new Promise((resolve, reject) => {
            nodemailer(smtpOptions).sendMail(mailOptions, function (err) {
                if (err)
                    reject(err)
                else
                    resolve('E-mail para %s enviado!', mailOptions.from)
            });
        })
    }
}

module.exports = NodemailerService;