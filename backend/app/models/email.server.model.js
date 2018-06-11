/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var EmailSchema = new Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, required: false },
    text: { type: String, required: false },
    html: { type: String, required: false },
    attempt: { type: Number, required: false },
    smtp: {
        host: { type: String, required: false },
        port: { type: String, required: false },
        require_tls: { type: Boolean, required: false },
        reject_unauthorized: { type: Boolean, required: false },
        auth_user: { type: String, required: false },
        auth_pass: { type: String, required: false }
    }
}, {
        timestamps: true
    });

mongoose.model('Email', EmailSchema);