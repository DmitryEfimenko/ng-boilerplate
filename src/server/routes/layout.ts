import express = require('express');
import path = require('path');

export function layout(req: express.Request, res: express.Response) {
    res.render('index');
}