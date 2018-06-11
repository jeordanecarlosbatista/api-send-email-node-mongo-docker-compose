/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.setMaxListeners(0);

const mongoose = require('./config/mongoose')
const express = require('./config/express')

//check the environment variable, development is default
//mongoose file must be loaded before all other files in order to provide
//connect to a database
mongoose();
//start the server
express(function (app) {
  app.listen(3000, function () {
    console.log("Started server on port 3000");
    setInterval(require('./config/job'), 50000);
  });
});