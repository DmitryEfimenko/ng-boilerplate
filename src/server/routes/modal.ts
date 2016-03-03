import express = require('express');

export function modal(req: express.Request, res: express.Response) {
    res.render('modals/' + req.params.page + '/' + req.params.name);
}