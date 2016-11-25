var path = require('path');

function tlog(msg) {
    global.telemetryLog(msg, true);
}
process.stdout.write = tlog;
process.stderr.write = tlog;

var winston = require('winston');
var fs = require('fs');

let testfile = __dirname + path.sep + 'testfile.txt'
let testfileMissing = __dirname + path.sep + 'testfileMissing.txt'

let logfile = __dirname + path.sep + 'app.log';
winston.add(winston.transports.File, { filename: logfile });

function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    winston.info('Async fs Exists');
    fs.exists(testfile, function (exists) {
        winston.info(`The file ${exists ? 'exists' : 'is missing'}.`);
        winston.debug('But no debug!!!');

        cb();
    });
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    winston.info('Async fs (not) Exists');
    fs.exists(testfileMissing, function (exists) {
        winston.info(`The file ${exists ? 'exists' : 'is missing'}.`);

        cb();
    });
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    winston.level = 'debug';

    winston.info('Async fs Read');
    fs.readFile(testfile, function (err, data) {
        winston.info('The file data is:', {msg: 'json', contents: data.toString(), num: 3});
        winston.debug('Now with debug too!!!');

        cb();
    });
}

function queryTest(cb) {
    telemetryLog('Query test', true);

    var options = {
        limit: 2,
        fields: ['message']
    };


    winston.info('Query test');
    winston.query(options, function (err, results) {
        if (err) {
            telemetryLog('error in query', true);
        }
        telemetryLog(JSON.stringify(results), true);

        cb();
    });

}

////////

var wlPos = 0;
var worklist = [basicTest1, basicTest2, basicTest3, queryTest];

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