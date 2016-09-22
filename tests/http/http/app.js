
var http = require('http');

function handler(request, response) {
    response.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });

    if(request.url === '/') {
        handleRequestWith(request, response, 200, 'Http Test Server');
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
            handleRequestWith(request, response, 200, 'Take care now!');
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
    var msg = 'Handshake';

    var options = {
        host: '127.0.0.1',
        port: 1338,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': msg.length
        }
    };

    var httpreq = http.request(options);
    httpreq.write(msg);
    httpreq.end();
});
