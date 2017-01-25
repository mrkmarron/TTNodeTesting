var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var http = require('http');
var rocky = require('rocky');

var proxy = rocky(); 
proxy
  .all('*')
  .forward('http://127.0.0.1:9000')
  .options({ forwardHost: true })
  .on('proxy:error', function (err) {
    telemetryLog(`Error: ${err}`, true)
  })
  .on('proxyReq', function (proxyReq, req, res, opts) {
    telemetryLog(`Proxy request: ${req.url}`, true)
  })
  .on('proxyRes', function (proxyRes, req, res) {
    telemetryLog(`Proxy response: ${req.url} with status ${res.statusCode}`, true)
  });

proxy.listen(1337);

function handler(req, res) {
    if(req.url === '/') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Http-Proxy Test Server...');
    }
    else if(req.url === '/hello') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Hello World!');
    }
    else 
    {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });

        if (req.url === '/exit') {
            handleRequestWith(req, res, 200, 'Exiting!');
        }
        else {
            handleRequestWith(req, res, 200, 'Unknown Command');

            exitcode = 1;
        }

        proxy.close(function () {
            server.close();
        });
    }
}

///////////////////////////////

function handleRequestWith(req, res, status, body) {
    telemetryLog(`Request: ${req.method} ${req.url}`, true);
    telemetryLog(`Response: ${status} ${body}`, true);

    res.writeHead(status, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
    res.write(body);
    res.end();
}


let server = http.createServer(handler);

var exitcode = 0;
server.on('close', function () {
    process.exit(exitcode);
});

server.listen(9000, function () {
    telemetryLog("Handshake", true);
});


