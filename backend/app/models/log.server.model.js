/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var LogSchema = new Schema({
    descricao: {type: String, required: false},
    command: {type: String, required: false},
    code: {type: String, required: false},
    stack: {type: String, required: false},
    type: {type: String, required: false},
    idEmail: {type: String, required: false},
}, {
    timestamps: true
});

mongoose.model('Log', LogSchema);