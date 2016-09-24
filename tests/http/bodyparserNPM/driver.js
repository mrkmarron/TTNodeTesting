var http = require('http');
var zlib = require('zlib');

function doHttpPut(url, jsonObj, cb) { 
    var msg = JSON.stringify(jsonObj);
    
    var options = {
        host: '127.0.0.1',
        port: 1337,
        path: url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': msg.length
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

    httpreq.end(msg);
}

function doHttpPutC(url, jsonObj, cb) {
    zlib.deflate(JSON.stringify(jsonObj), function (err, buffer) {
        if (err) {
            cb(null);
        }
        else {
            var options = {
                host: '127.0.0.1',
                port: 1337,
                path: url,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'deflate',
                    'Content-Length': buffer.length
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

            httpreq.end(buffer);
        }
    });
}

exports.driver = [
    function (callback) {
        var jsonObj = {name: 'mark', id: 3, notes: ['yes', 'no', 'maybe']};  
        doHttpPut('/user1', jsonObj, function (body) {
            //console.log(`PUT /user1 => ${body}`);
            callback(null)
        });
    },
    function (callback) {
        var jsonObj = {name: 'sandeep', id: 4, notes: ['yes', 'no']};  
        doHttpPutC('/user2', jsonObj, function (body) {
            //console.log(`PUT /user2 => ${body}`);
            callback(null)
        });
    }
]
