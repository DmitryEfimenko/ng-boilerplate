import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');
var routes = require('./routes');
import multer = require('multer');
var upload = multer();

var auth = (req: express.Request, res: express.Response, next)=> {
    if (!req.isAuthenticated()) res.status(401).end();
    else next();
};

class RouteHandler {
    static initialize(router: express.Router, passport) {
        routes.walk(path.join(__dirname, 'routes'));
        
        //console.dir(routes);
        router.get('/', routes.layout);
        router.get('/login', routes.layout);
        router.get('/modals/:page/:name', routes.modal);
        router.get('/views/*', routes.views);

        router.get('/api/isLoggedIn', routes.api.auth);
        router.get('/api/signout', routes.api.signout);
        
        router.post('/api/login', passport.authenticate('local'), (req, res)=> { res.send(req.user); });
    }
}
export = RouteHandler;