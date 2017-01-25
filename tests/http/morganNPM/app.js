var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var http = require('http');
var express = require('express');
var morgan = require('morgan');

var ttdLogStream = {
    write: function(msg) {
        telemetryLog(msg.toString(), true);
    }
};

var app = express();

var moptions = {stream: ttdLogStream};
app.use(morgan('combined', moptions));

app.get('/', function (req, res) {
    handleRequestWith(req, res, 200, 'Express Test Server...');
});

app.get('/hello', function (req, res) {
    handleRequestWith(req, res, 200, 'Hello World!');
});

app.get('/goodbye', function (req, res) {
    handleRequestWith(req, res, 200, 'Take care now!');
});

app.get('/exit', function (req, res) {
    handleRequestWith(req, res, 200, 'Exiting!');
    server.close();
});

///////////////////////////////

function handleRequestWith(req, res, status, body) {
    telemetryLog(`Request: ${req.method} ${req.url}`, true);
    telemetryLog(`Response: ${status} ${body}`, true);

    res.writeHead(status, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
    res.write(body);
    res.end();
}

let server = app.listen(1337, function () {
    telemetryLog("Handshake", true);
});

var exitcode = 0;
server.on('close', function () {
    process.exit(exitcode);
});
