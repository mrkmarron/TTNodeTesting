var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var React = require('react'); 
var ReactDOMServer = require('react-dom/server'); 
var HelloWorld = require('./components/helloWorld'); 
var express = require('express')

var app = express()
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
 
app.get('/', function (req, res) {
    handleRequestWith(req, res, 200, 'Express Test Server...');
});

app.get('/hello', function (req, res) {
    var rdom = React.createElement(HelloWorld);
    var domStr = ReactDOMServer.renderToStaticMarkup(rdom);

    telemetryLog(domStr, true);
    res.render('layout', {content: domStr});
});

app.get('/hellofull', function (req, res) {
    var rdom = React.createElement(HelloWorld);
    var domStr = ReactDOMServer.renderToString(rdom);

    telemetryLog(domStr, true);
    res.render('layout', {content: domStr});
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
