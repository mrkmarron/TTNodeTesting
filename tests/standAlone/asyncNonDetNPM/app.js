var fs = require('fs');
var async = require('async');

let clist = [
    function (callback) { setTimeout(function () { telemetryLog('one', true); callback(null, 'one'); }, 10 * Math.random()); },
    function (callback) { setTimeout(function () { telemetryLog('two', true); callback(null, 'two'); }, 10 * Math.random()); },
    function (callback) { setTimeout(function () { telemetryLog('three', true); callback(null, 'three'); }, 10 * Math.random()); },
    function (callback) { setTimeout(function () { telemetryLog('four', true); callback(null, 'four'); }, 10 * Math.random()); },
    function (callback) { setTimeout(function () { telemetryLog('five', true); callback(null, 'five'); }, 10 * Math.random()); }
];

function raceTest(cb) {
    telemetryLog('Race test', true);

    async.race(clist, function (err, results) {
        telemetryLog(JSON.stringify(results), true);
        
        cb();
    });
}

function parallelTest(cb) {
    telemetryLog('Parallel test', true);

    async.parallel(clist,
    function (err, results) {
        telemetryLog(JSON.stringify(results), true);

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [raceTest, parallelTest, raceTest, parallelTest];

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