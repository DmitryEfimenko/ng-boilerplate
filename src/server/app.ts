/// <reference path="../types/types.ts"/>

import app = require('./server');
//import MemoryStorageData = require('./Server/Storage/MemoryStorageData');
//import Calls = require('./spec/pageCalls/calls');


var port = process.env.PORT || 8081;
var appInstance = app.init();

if (appInstance.get('env') === 'development') {
    //MemoryStorageData.init(new Calls(), () => {
        initServer();
    //});
} else {
    initServer();
}

function initServer() {
    var server = appInstance.listen(port, () => {
        var host = server.address().address;
        var port = server.address().port;

        console.log(`App listening at http://${host}:${port}`);
    });
}