var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var fs = require('fs');

let testDir = __dirname + path.sep + 'testDir' + path.sep;
let dir1 = testDir + 'dir1' + path.sep;
let dir2 = testDir + 'dir2' + path.sep;

let srcFile1 = dir1 + 'file1.json';
let srcFile2 = dir1 + 'file2.json';

let dstFile1 = dir2 + 'filex1.json';
let dstFile2 = dir2 + 'filex2.json';

let notExistsSrcFile = __dirname + path.sep + 'doesNotExistSrc.txt';
let notExistsDstFile = __dirname + path.sep + 'doesNotExistDst.txt';

function realPathAsyncTest(cb) {
    telemetryLog('RealPath async test', true);

    var relpath = dir1 + '..' + path.sep + 'dir1' + path.sep + 'file1.json';
    fs.realpath(relpath, function(err, resolvedPath) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`resolvedPathLast=${resolvedPath[resolvedPath.length - 1]}`, true);
            telemetryLog(`nodotdot=${resolvedPath.toString().indexOf('..')}`, true);
        }

        cb();
    });
}

function readJsonSyncTest(cb) {
    telemetryLog('ReadJson sync test', true);

    try {
        var databuff = fs.readFileSync(srcFile1);
        telemetryLog(`databuff length=${databuff.length} databuff[0]=${databuff[0]}`, true);
        telemetryLog(`fulldata=${databuff}`, true);
    }
    catch(e) {
        telemetryLog(`Error: ${e}`, true);
    }

    cb();
}

function readJsonAsyncTest(cb) {
    telemetryLog('ReadJson async test', true);

    fs.readFile(srcFile2, function(err, databuff) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`databuff length=${databuff.length} databuff[0]=${databuff[0]}`, true);
            telemetryLog(`fulldata=${databuff}`, true);
        }

        cb();
    });
}

function readJsonEncodingSyncTest(cb) {
    telemetryLog('ReadJson encoding sync test', true);

    try {
        var string = fs.readFileSync(srcFile1, 'ascii');
        telemetryLog(`string length=${string.length} string[0]=${string[0]}`, true);
        telemetryLog(`fulldata=${string}`, true);
    }
    catch(e) {
        telemetryLog(`Error: ${e}`, true);
    }

    cb();
}

function readJsonEncodingAsyncTest(cb) {
    telemetryLog('ReadJson encoding async test', true);

    fs.readFile(srcFile2, 'ascii', function(err, string) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`string length=${string.length} string[0]=${string[0]}`, true);
            telemetryLog(`fulldata=${string}`, true);
        }

        cb();
    });
}

function statAsyncTest(cb) {
    telemetryLog('Access async test', true);

    fs.stat(srcFile2, function(err, stats) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`Ok!`, true);
        }

        cb();
    });
}

function readJsonEncodingBuffCBAsyncTest(cb) {
    telemetryLog('ReadJson file event test', true);

    var fsrs = fs.createReadStream(srcFile2);

    fsrs.on('data', function(chunk) {
        //This might change if they change the default chunk size but should be mostly stable
        telemetryLog(`chunk length=${chunk.length} chunk[0]=${chunk[0]}`, true);
        telemetryLog(`fulldata=${chunk}`, true);
    });

    fsrs.on('end', function() {
        telemetryLog('Read complete.', true);
        cb();
    });
}

function accessAsyncTest(cb) {
    telemetryLog('Access async test', true);

    fs.access(srcFile2, fs.constants.F_OK, function(err) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`Ok!`, true);
        }

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [realPathAsyncTest, readJsonSyncTest, readJsonAsyncTest, readJsonEncodingSyncTest, readJsonEncodingAsyncTest, statAsyncTest, readJsonEncodingBuffCBAsyncTest, accessAsyncTest];

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