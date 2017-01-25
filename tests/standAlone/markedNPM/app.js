var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

let marked = require('marked');

function boldTest(cb) {
    telemetryLog('Bold test', true);

    let res = marked('I am using __markdown__.');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

function linkTest(cb) {
    telemetryLog('Link test', true);

    let res = marked('I am using [markdown](https://www.npmjs.com/package/marked).');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

function blockquoteTest(cb) {
    telemetryLog('Blockquote test', true);

    let res = marked('I am using\n---\n> markdown');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

function list1Test(cb) {
    telemetryLog('List1 test', true);

    let res = marked('I am using\n* _markdown_\n* with a list');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

function list2Test(cb) {
    telemetryLog('List2 test', true);

    let res = marked('I am using\n- __markdown__\n- with a list');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

function inlinecodeTest(cb) {
    telemetryLog('Inline code test', true);

    let res = marked('I am using `var v = "markdown";`.');
    telemetryLog(`${res}`, true); // ... 

    cb();
}

////////

var wlPos = 0;
var worklist = [boldTest, linkTest, blockquoteTest, list1Test, list2Test, inlinecodeTest];

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