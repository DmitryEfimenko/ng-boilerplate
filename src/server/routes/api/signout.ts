import * as express from 'express';

export function signout(req: express.Request, res: express.Response) {
    req.session.destroy(() => { });
    req.logOut();
    res.end();
}