var fs = require('fs');
var async = require('async');

let nlist = ['one', 'two', 'three'];
let ilist = [1, 2, 3];

function eachTest(cb) {
    telemetryLog('Each test', true);

    let robj = {};
    async.each(nlist, function (n, callback) {
        robj[n] = nlist.indexOf(n);
        callback();
    }, function (err) {
        if (err) {
            telemetryLog('Failed', true);
        } else {
            telemetryLog(JSON.stringify(robj), true);
        }

        cb()
    });
}

function failTest(cb) {
    telemetryLog('Fail each test', true);

    let robj = {};
    async.each(nlist, function (n, callback) {

        if (n === 'two') {
            callback('Got two');
        }
        else {
            robj[n] = nlist.indexOf(n);
            callback();
        }

    }, function (err) {
        if (err) {
            telemetryLog('Failed (as expected) with ' + err, true);
        } else {
            console.log('All files have been processed successfully');
        }
    });

    cb();
}

function everyTestTrue(cb) {
    telemetryLog('Every test true', true);

    async.every(nlist, function (n, callback) {
        callback(null, nlist.indexOf(n) !== -1);
    }, function (err, result) {
        telemetryLog(`${result}`, true)
        cb();
    });
}

function everyTestFalse(cb) {
    telemetryLog('Every test false', true);

    async.every(nlist, function (n, callback) {
        callback(null, nlist.indexOf(n) < 2);
    }, function (err, result) {
        telemetryLog(`${result}`, true)
        cb();
    });
}

function _isOdd(v, callback) {callback(null, v % 2 === 1);}
function filterTest(cb) {
    telemetryLog('Filter test', true);

    async.filter(ilist, _isOdd, function (err, results) {
        telemetryLog(JSON.stringify(results), true);
        cb();
    });
}

function _addOne(v, callback) {callback(null, v + 1);}
function mapTest(cb) {
    telemetryLog('Map test', true);

    async.map(ilist, _addOne, function(err, results){
        telemetryLog(JSON.stringify(results), true);
        cb();
    });
}

function seriesTest(cb) {
    telemetryLog('Series test', true);

    var acc = 0
    async.series([
        function (callback) {
            acc += 2;
            callback(null);
        },
        function (callback) {
            acc += 3;
            callback(null);
        }
    ],
    function (err, results) {
        telemetryLog(`acc is ${acc}`, true);

        cb();
    });
}

function parallelTest(cb) {
    telemetryLog('Parallel test', true);

    var acc = 0
    async.parallel([
        function (callback) {
            setTimeout(function() {
                acc += 2;
                callback(null);
            }, 10);
        },
        function (callback) {
            setTimeout(function() {
                acc += 3;
                callback(null);
            }, 10);
        }
    ],
    function (err, results) {
        telemetryLog(`acc is ${acc}`, true);

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [eachTest, failTest, everyTestTrue, everyTestFalse, filterTest, mapTest, seriesTest, parallelTest];

function Process() {
    if(wlPos === worklist.length) {
        telemetryLog('Done!', true);
    }
    else {
        if (wlPos !== 0) {
            telemetryLog('', true);
        }

        var task = worklist[wlPos];
        wlPos++;

        setImmediate(function () { task(Process); });
    }
}

setImmediate(Process);