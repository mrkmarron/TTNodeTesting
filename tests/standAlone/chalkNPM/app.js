var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var chalk = require('chalk');
 
function basicTest1(cb) {
    telemetryLog('Basic test 1', true);

    telemetryLog(`${chalk.blue('Hello world!')}`, true);

    cb();
}

function basicTest2(cb) {
    telemetryLog('Basic test 2', true);

    telemetryLog(`${chalk.blue('Hello') + 'World' + chalk.red('!')}`, true);

    cb();
}

function basicTest3(cb) {
    telemetryLog('Basic test 3', true);

    telemetryLog(`${chalk.blue.bgRed.bold('Hello world!')}`, true);

    cb();
}

function basicTest4(cb) {
    telemetryLog('Basic test 4', true);

    telemetryLog(`${chalk.blue('Hello', 'World!', 'Foo', 'bar', 'biz', 'baz')}`, true);

    cb();
}

function basicTest5(cb) {
    telemetryLog('Basic test 5', true);

    telemetryLog(`${chalk.red('Hello', chalk.underline.bgBlue('world') + '!')}`, true);

    cb();
}

function basicTest6(cb) {
    telemetryLog('Basic test 6', true);

    telemetryLog(`${chalk.green('I am a green line ' + chalk.blue.underline.bold('with a blue substring') + ' that becomes green again!')}`, true);

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