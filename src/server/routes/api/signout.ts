import express = require('express');

export function signout(req: express.Request, res: express.Response) {
    req.session.destroy(() => { });
    req.logOut();
    res.end();
}