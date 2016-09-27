var http = require('http');
var httpProxy = require('http-proxy');


var proxy = httpProxy.createProxyServer({}); 
var proxyServer = http.createServer(function (req, res) {  
  if (req.url.match('/hello')) {
    req.url = req.url.replace('/hello', '/helloprxy');
  }

  proxy.web(req, res, {target: 'http://127.0.0.1:9000'});
});

proxyServer.on('close', function() {
    server.close();
})

proxyServer.listen(1337);

function handler(req, res) {
    if(req.url === '/') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Http-Proxy Test Server...');
    }
    else if(req.url === '/hello') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Hello World! -- no proxy');
    }
    else if(req.url === '/helloprxy') {
        res.writeHead(200, { "Content-Type": "text/html", 'Cache-control': 'no-cache' });
        handleRequestWith(req, res, 200, 'Hello World! -- with proxy');
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

        proxyServer.close();
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


