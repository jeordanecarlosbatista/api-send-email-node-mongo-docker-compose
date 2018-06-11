/**
 * Created by vdimitrieski on 17.6.16..
 */
'use strict';

const path = require('path')
var express = require('express'),
    bodyParser = require('body-parser'), //handle request body data
    methodOverride = require('method-override'),//legacy support for DELETE and PUT
    swaggerUi = require('swagger-ui-express'),
    swaggerTools = require("swagger-tools"),
    YAML = require("yamljs"),
    auth = require(path.join(__dirname, "../api/helpers/auth")),
    swaggerConfig = YAML.load(path.join(__dirname, '../api/swagger/swagger.yaml'))

/**
 * Configure express server
 * @returns {express configuration}
 */
module.exports = function (callback) {
    //get the server
    var app = express();
    var subpath = express();

    //configure the server
    // if (process.env.NODE_ENV === 'development') {
    //     //dev config
    //     app.use(morgan('dev')); //logger
    // } else if (process.env.NODE_ENV === 'production') {
    //     //production config
    //     app.use(compress()); //compress content
    // }

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //rest API requirements
    app.use(bodyParser.json());
    app.use(methodOverride());

    /* eslint-disable no-unused-vars */
    //error middleware
    //TODO put this in development only and for production obscure messages
    app.use(function (err, req, res, next) {
        res.status(err.status);
        res.send(err);
    });
    /* eslint-enable no-unused-vars */

    //add routes
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig, true)); //show explorer
    // app.use('/api/v1', require('../app/routes/email.server.router'));
    // app.use('/api/v1', require('../app/routes/log.server.router'));

    swaggerTools.initializeMiddleware(swaggerConfig, function (middleware) {
        app.use(middleware.swaggerMetadata()); // needs to go BEFORE swaggerSecurity

        app.use(
            middleware.swaggerSecurity({
                //manage token function in the 'auth' module
                Bearer: auth.verifyToken
            })
        );

        //Serves the Swagger UI on /docs
        var routerConfig = {
            controllers: path.join(__dirname, '../api/controllers'),
            useStubs: false
        };
        app.use(middleware.swaggerRouter(routerConfig));
        app.use(middleware.swaggerUi());
        callback(app)
    });
};