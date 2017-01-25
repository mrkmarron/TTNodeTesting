var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var moment = require('moment');
 
var date = undefined;

function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    date = moment('2013-02-08 09:30:26.123+07:00');
    telemetryLog(`${date} isValid ${date.isValid()}`, true);
    telemetryLog(`${date.format('dddd, MMMM Do YYYY, h:mm:ss a')}`, true);
    telemetryLog(`${date.format('[today] dddd')}`, true);

    cb();
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    telemetryLog(`${date.day()}`, true);
    date.day('Saturday');
    telemetryLog(`${date}`, true);

    telemetryLog(`${date.dayOfYear()}`, true);
    date.dayOfYear(270);
    telemetryLog(`${date}`, true);

    cb();
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    date.add(5, 'd');
    telemetryLog(`${date}`, true);

    date.add(270, 's');
    telemetryLog(`${date}`, true);

    date.startOf('week');
    telemetryLog(`${date}`, true);

    cb();
}

function basicTest4(cb) {
    telemetryLog('Basic test 4', true);

    var recently = moment('2015-02-08 09:30:26.123+07:00');

    telemetryLog(`${recently.fromNow()}`, true);
    telemetryLog(`${recently.from(date)}`, true);
    telemetryLog(`${date.to(recently)}`, true);
    telemetryLog(`${date.calendar()}`, true);

    cb();
}

function basicTest5(cb) {
    telemetryLog('Basic test 5', true);

    telemetryLog(`${moment('2010-10-20').isBefore('2010-10-21')}`, true);
    telemetryLog(`${moment('2010-10-20').isBefore('2010-12-31', 'year')}`, true);
    telemetryLog(`${moment('2010-10-20').isBefore('2010-01-01', 'year')}`, true);

    cb();
}

function basicTest6(cb) {
    telemetryLog('Basic test 6', true);

    telemetryLog(`${moment('2010-10-20').isBetween('2010-10-19', '2010-10-25')}`, true);
    telemetryLog(`${moment('2010-10-20').isBetween('2010-01-01', '2012-01-01', 'year')}`, true);
    telemetryLog(`${moment('2010-10-20').isBetween('2009-12-31', '2012-01-01', 'year')}`, true);

    telemetryLog(`${moment('2016-10-30').isBetween('2016-10-30', '2016-12-30', null, '()')}`, true);
    telemetryLog(`${moment('2016-10-30').isBetween('2016-10-30', '2016-12-30', null, '[)')}`, true);

    cb();
}


////////

var wlPos = 0;
var worklist = [basicTest1, basicTest2, basicTest3, basicTest4, basicTest5, basicTest6];

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