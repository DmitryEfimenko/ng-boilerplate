import * as express from 'express';

export function auth(req: express.Request, res: express.Response) {
    var session = req.user;
    if (req.isAuthenticated()) {
        //var s = Models.Session.strippedFromReqUser(session);
        //res.status(200).send(s).end();
        res.status(200).send(session).end();
    } else
        res.status(401).end();
}