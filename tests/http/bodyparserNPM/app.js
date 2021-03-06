var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var express = require('express');
var bodyParser = require('body-parser');

var app = express(); 
var jsonParser = bodyParser.json();

app.get('/', function (req, res) {
    handleRequestWith(req, res, 200, 'Express Test Server...');
});

app.put('/user1', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  handleRequestWith(req, res, 200, `name: ${req.body.name}, id: ${req.body.id}, nlength: ${req.body.notes.length}`); 
});

app.put('/user2', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  handleRequestWith(req, res, 200, `name: ${req.body.name}, id: ${req.body.id}, nlength: ${req.body.notes.length}`); 
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
