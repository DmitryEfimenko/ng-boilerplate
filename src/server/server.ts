import express = require('express');
import path = require('path');
//var favicon = require('serve-favicon');
//import logger = require('morgan');
//import cookieParser = require('cookie-parser');
//import bodyParser = require('body-parser');
import session = require('express-session');
import passport = require('passport');
import Passport = require('./passport');
import routeHandler = require('./routeHandler');
//import Db = require('./Server/Storage/Db');
//import MemoryStorage = require('./Server/Storage/MemoryStorage');
//import PgSqlStorage = require('./Server/Storage/PgSqlStorage');

export function init() {
    var routeLayout = require('./routes/layout');

    var app = express();

    Passport.configure(passport); // pass passport for configuration

    // view engine setup
    app.set('views', path.join(__dirname, '../views'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    //app.use(logger('dev'));
    //app.use(bodyParser.json({ limit: '50mb' }));
    //app.use(bodyParser.urlencoded({ extended: false }));
    
    app.use((req, res, next) => {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        // Pass to next layer of middle-ware
        next();
    });

    //app.use(cookieParser('dbDima is pretty sweet and awesome'));
    app.use('/style', express.static(path.join(__dirname, '../style')));
    app.use('/vendor', express.static(path.join(__dirname, '../vendor')));
    app.use('/client', express.static(path.join(__dirname, '../client')));

    app.use(session({ secret: 'This is awesome secret', cookie: { maxAge: 30 * 60 * 1000, httpOnly: false }, resave: false, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    var router = express.Router({ caseSensitive: false, strict: false });
    routeHandler.initialize(router, passport);
    app.use(router);
    // if none of routes above matched, use layout route and let angular handle it
    app.use((req, res, next) => {
        if (req.originalUrl.indexOf('/api') == -1) {
            res.status(404).end();
        } else {
            next();
        }
    });


    // error handlers

    // development error handler
    // will print stacktrace
    var errorHandlerDev: express.ErrorRequestHandler = (err, req: express.Request, res, next) => {
        console.log('--- errorHandlerDev');
        var userId = undefined;
        if (req.user && req.user.user) userId = req.user.user.id;
        var error = {
            message: err.message,
            userId: userId,
            stack: err.stack ? err.stack.replace('\n', '\r\n') : err,
        };
        console.log(error.stack);
        res.status(err.status || 500).send(error).end();
    };

    var errorHandlerProd: express.ErrorRequestHandler = (err, req, res, next) => {
        console.log('errorHandlerProd');
        res.status(err.status || 500).send({
            message: err.message,
            error: {}
        }).end();
    };
    
    app.set('env', 'development');
    if (app.get('env') === 'development') {
        app.use(errorHandlerDev);
    } else {
        // production error handler
        // no stack traces leaked to user
        app.use(errorHandlerProd);
    }

    process.setMaxListeners(0);
    process.on('uncaughtException', (err) => {
        console.log('Caught exception: ' + err);
        console.dir(err.stack);
    });

    return app;
}