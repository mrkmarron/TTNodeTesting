var http = require('http');

function doHttpGet(url, cb) {
    var options = {
        host: '127.0.0.1',
        port: 1337,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': 0
        }
    };

    var httpreq = http.request(options, function (res) {
        var responseString = '';

        res.on("data", function (data) {
            responseString += data;
        });

        res.on("end", function () {
            cb(responseString);
        });
    });

    httpreq.end();
}

exports.driver = [
    function (callback) {
        doHttpGet('/hello', function (body) {
            //console.log(`GET /hello => ${body}`);
            callback(null)
        });
    }
]
