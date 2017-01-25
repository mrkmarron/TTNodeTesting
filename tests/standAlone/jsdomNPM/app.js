let path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

let jsdom = require('jsdom');

let htmlf1 = __dirname + path.sep + 'test1.html';

function basicTest(cb) {
    console.log('Basic test', true);

    jsdom.env(
        htmlf1,
        [],
        function (err, window) {
            console.log(`err is ${err}`, true);
            console.log(`The count is ${window.document.documentURI}`, true);
            cb();
        }
    );
}

////////

var wlPos = 0;
var worklist = [basicTest];

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