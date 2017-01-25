var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var Promise = require('bluebird');

let nlist = ['one', 'two', 'three'];
let ilist = [1, 2, 3];

function _addOnep(v) {
    return new Promise(function(resolve, reject) {resolve(v + 1);});
}
function mapTest(cb) {
    telemetryLog('Map test', true);

    Promise.map(ilist, function(i) {
        return _addOnep(i);
    }).then(function(results) {
        telemetryLog(JSON.stringify(results), true);
        cb();
    });
}

function seriesTest(cb) {
    telemetryLog('Series test', true);

    Promise.mapSeries([{ timeout: 200, value: 1 },
                       { timeout: 100, value: 2 }], function (item) {
            return Promise.delay(item.timeout, item.value);
        }).then(function (results) {
            telemetryLog(`result is ${results}`, true);
            cb();
        });
}

function parallelTest(cb) {
    telemetryLog('Parallel test', true);

     Promise.all([Promise.delay(200, 'one'),
                  Promise.delay(200, 'two')]).then(function (results) {
            telemetryLog(`result is ${results}`, true);

            cb();
        });
}

////////

var wlPos = 0;
var worklist = [mapTest, seriesTest, parallelTest];

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