
function randomInitTest(cb) {
    telemetryLog('Random: seed not initialized', true);

    var rnd = Math.random();
    telemetryLog(`val: ${rnd}`, true);

    cb();
}

function randomGeneralTest(cb) {
    telemetryLog('Random: seed initialized', true);

    var rnd = Math.random();
    telemetryLog(`val: ${rnd}`, true);

    cb();
}

////////

var wlPos = 0;
var worklist = [randomInitTest, randomGeneralTest, randomGeneralTest, randomGeneralTest];

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

