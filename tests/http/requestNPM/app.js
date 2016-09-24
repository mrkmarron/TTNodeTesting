var http = require('http');
var request = require('request');

function handler(req, res) {
    if(req.url === '/') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Request Test Server...');
    }
    else if(req.url === '/hello') {
        var x = request('http://127.0.0.1:1337/helloprxy');
        req.pipe(x);
        x.pipe(res);
    }
    else if(req.url === '/helloprxy') {
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

        server.close();
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

server.listen(1337, function () {
    telemetryLog("Handshake", true);
});


