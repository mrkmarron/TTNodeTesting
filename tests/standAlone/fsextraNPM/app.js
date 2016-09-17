var path = require('path');
var fsextra = require('fs-extra');

let testDir = __dirname + '\\testDir\\';
let dir1 = testDir + 'dir1\\';
let dir2 = testDir + 'dir2\\';

let srcFile1 = dir1 + 'file1.json';
let srcFile2 = dir1 + 'file2.json';

let dstFile1 = dir2 + 'filex1.json';
let dstFile2 = dir2 + 'filex2.json';

let notExistsSrcFile = __dirname + '\\doesNotExistSrc.txt';
let notExistsDstFile = __dirname + '\\doesNotExistDst.txt';

function existsSyncTest(cb) {
    telemetryLog('Exists sync test', true);

    try {
        fsextra.ensureDirSync(dir1);
        telemetryLog(`Ok!`, true);
    }
    catch(e) {
        telemetryLog(`Error: ${e}`, true);
    }

    cb();
}

function existsAsyncTest(cb) {
    telemetryLog('Exists async test', true);

    fsextra.ensureDir(dir2, function(err) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`Ok!`, true);
        }

        cb();
    });
}

function writeJsonSyncTest(cb) {
    telemetryLog('WriteJson sync test', true);

    try {
        fsextra.writeJsonSync(srcFile1, {name: 'fs-extra'});
        telemetryLog(`Ok!`, true);
    }
    catch(e) {
        telemetryLog(`Error: ${e}`, true);
    }

    cb();
}

function writeJsonAsyncTest(cb) {
    telemetryLog('WriteJson async test', true);

    fsextra.writeJson(srcFile2, {name: 'fs-extra'}, function(err) {
        if(err !== null) {
            telemetryLog(`Error: ${err}`, true);
        }
        else {
            telemetryLog(`Ok!`, true);
        }

        cb();
    });
}

var items = [] // files, directories, symlinks, etc 
function walkTest(cb) {
    telemetryLog('Walk test', true);

    fsextra.walk(testDir)
        .on('data', function (item) {
            items.push(item)
        })
        .on('end', function () {
            //assume walk order is stable...
            for(var i = 0; i < items.length; ++i) {
                let fname = path.basename(items[i].path);
                let kind = 'unknown';
                if(items[i].stats.isFile()) {
                    kind = 'file';
                }
                else if(items[i].stats.isDirectory()) {
                    kind = 'directory';
                }
                else{
                    ;
                }

                telemetryLog(`${fname} is a ${kind}`, true);
            }
            cb();
        });
}


function failCopySyncTest(cb) {
    telemetryLog('Fail move sync test', true);

    try {
        fsextra.copySync(notExistsSrcFile, notExistsDstFile);
        telemetryLog(`Ok!`, true);
    }
    catch(e) {
        telemetryLog(`Error when copying (as expected)`, true);
    }

    cb();
}

function failMoveAsyncTest(cb) {
    telemetryLog('Fail move async test', true);

    fsextra.move(notExistsSrcFile, notExistsDstFile, function(err) {
        if(err !== null) {
            telemetryLog(`Error when moving (as expected)`, true);
        }
        else {
            telemetryLog(`Ok!`, true);
        }

        cb();
    });
}

function copySyncTest(cb) {
    telemetryLog('Copy sync test', true);

    try {
        fsextra.copySync(srcFile1, dstFile1, {name: 'fs-extra'});
        telemetryLog(`Ok!`, true);
    }
    catch(e) {
        telemetryLog(`Error: ${e}`, true);
    }

    cb();
}

function copyAsyncTest(cb) {
    telemetryLog('Copy async test', true);

    fsextra.copy(srcFile2, dstFile2, function(err) {
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
var worklist = [existsSyncTest, existsAsyncTest, writeJsonSyncTest, writeJsonAsyncTest, walkTest, failCopySyncTest, failMoveAsyncTest, copySyncTest, copyAsyncTest];

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