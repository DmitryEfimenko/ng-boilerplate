import express = require('express');

export function views(req: express.Request, res: express.Response) {
    res.render(req.params[0]);
}