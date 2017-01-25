var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var http = require('http');

function handler(request, response) {
    response.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });

    if(request.url === '/') {
        handleRequestWith(request, response, 200, 'Http Test Server...');
    }
    else if(request.url === '/hello') {
        handleRequestWith(request, response, 200, 'Hello World!');
    }
    else if(request.url === '/goodbye') {
        handleRequestWith(request, response, 200, 'Take care now!');
    }
    else 
    {
        if (request.url === '/exit') {
            handleRequestWith(request, response, 200, 'Exiting!');
        }
        else {
            handleRequestWith(request, response, 200, 'Unknown Command');

            exitcode = 1;
        }

        server.close();
    }
}

///////////////////////////////

function handleRequestWith(req, res, status, body) {
    telemetryLog(`Request: ${req.method} ${req.url}`, true);
    telemetryLog(`Response: ${status} ${body}`, true);

    res.write(body);
    res.end();
}

let server = http.createServer(handler);

var exitcode = 0;
server.on('close', function () {
    process.exit(exitcode);
})

server.listen(1337, function () {
    telemetryLog('Handshake', true);
});
