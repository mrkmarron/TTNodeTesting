
var minimist = require('minimist');

function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    let res = minimist('-a beep -b boop'.split(' '));
    telemetryLog(JSON.stringify(res), true);

    cb();
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    let res = minimist('-x 3 -y 4 -n5 -abc --beep=boop foo bar baz'.split(' '));
    telemetryLog(JSON.stringify(res), true);

    cb();
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    let res = minimist('one two three -- four five --six'.split(' '), { '--': true });
    telemetryLog(JSON.stringify(res), true);

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTest1, basicTest2, basicTest2, basicTest3];

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