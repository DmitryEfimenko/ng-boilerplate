import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as multer from 'multer';

var routes = require('./routes');
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