
process.env.DEBUG = 'fs';

var debug = require('debug')('fs');
var fs = require('fs');

function tlog(msg) {
    global.telemetryLog(`${msg}`, true);
}
debug.log = tlog;

let testfile = __dirname + '\\testfile.txt'
let testfileMissing = __dirname + '\\testfileMissing.txt'

function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    debug('Async fs Exists');
    fs.exists(testfile, function (exists) {
        debug(`The file ${exists ? 'exists' : 'is missing'}.`);

        cb();
    });
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    debug('Async fs (not) Exists');
    fs.exists(testfileMissing, function (exists) {
        debug(`The file ${exists ? 'exists' : 'is missing'}.`);

        cb();
    });
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    debug('Async fs Read');
    fs.readFile(testfile, function (err, data) {
        debug(`The file data is: "${data}"`);

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [basicTest1, basicTest2, basicTest3];

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