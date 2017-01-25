var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

function tlog(msg) {
    global.telemetryLog(msg, true);
}
process.stdout.write = tlog;
process.stderr.write = tlog;

var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'myapp' });

var fs = require('fs');

let testfile = __dirname + path.sep + 'testfile.txt'
let testfileMissing = __dirname + path.sep + 'testfileMissing.txt'

function demoTest1(cb) {
    telemetryLog('Demo test 1', true);

    log.info('hi');
    log.warn({ lang: 'fr' }, 'au revoir');

    cb();
}

function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    log.info('Async fs Exists');
    fs.exists(testfile, function (exists) {
        log.info(`The file ${exists ? 'exists' : 'is missing'}.`);
        log.debug('But no debug!!!');

        cb();
    });
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    log.info('Async fs (not) Exists');
    fs.exists(testfileMissing, function (exists) {
        log.info(`The file ${exists ? 'exists' : 'is missing'}.`);

        cb();
    });
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    log.level(0, 'debug');

    log.info('Async fs Read');
    fs.readFile(testfile, function (err, data) {
        log.info('The file data is:', { msg: 'json', contents: data.toString(), num: 3 });
        log.debug('Now with debug too!!!');

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [demoTest1, basicTest1, basicTest2, basicTest3];

function Process() {
    if (wlPos === worklist.length) {
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