import app = require('./server');

var port = process.env.PORT || 8081;
var appInstance = app.init();

if (appInstance.get('env') === 'development') {
    // any additional dev env logic
    initServer();
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