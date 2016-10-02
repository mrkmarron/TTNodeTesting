let assert = require('assert');
let cProcess = require('child_process');
let path = require('filepath');
let chalk = require('chalk');
let http = require('http');
let async = require('async');

function printTestFailMsg(msg) {
    console.log(chalk.bold.red(msg));
} 

function doHttpGet(url, cb) {
    var options = {
        host: '127.0.0.1',
        port: 1337,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': 0
        }
    };

    var httpreq = http.request(options, function (res) {
        var responseString = '';

        res.on("data", function (data) {
            responseString += data;
        });

        res.on("end", function () {
            cb(responseString);
        });
    });

    httpreq.end();
}

function driveTest(testArray) {
    doHttpGet('/', function (bodyi) {
        //console.log(`GET / => ${bodyi}`);

        async.waterfall(
        testArray,
        function () {
            doHttpGet('/exit', function (bodye) {
                //console.log(`GET /exit => ${bodye}`);
            });
        });
    });
}

function startup(cb, tobj, sinterval, hlength, driver) {
    let cmd = tobj.nodeExePath.toString();
    let args = ['--nolazy', '-TTRecord:ttlog', `-TTSnapInterval:${sinterval}`, `-TTHistoryLength:${hlength}`, tobj.exeFile.toString()];
    let options = { cwd: tobj.nodeExePath.dir().toString() };

    let shutDownId = undefined;
    let cproc = cProcess.spawn(cmd, args, options);

    cproc.on('error', function(err) {
        printTestFailMsg(JSON.stringify(err));
    });

    let stdoutResult = undefined;
    cproc.stdout.on('data', function (data) {
        //console.log(`stdout -> ${data}`);

        if (stdoutResult === undefined) {
            stdoutResult = '';

            if (shutDownId !== undefined) {
                clearTimeout(shutDownId);
                shutDownId = undefined;
            }

            driveTest(driver);
        }

        stdoutResult += data;
    });

    let stderrResult = undefined;
    cproc.stderr.on('data', function (data) {
        console.log(`stderr -> ${data}`);

        if (stderrResult === undefined) {
            stderrResult = '';
        }

        stderrResult += data;
    });

    cproc.on('close', function (code) {
        let success = false;

        //console.log(`exit -> ${code}`);
        if (code !== 0) {
            printTestFailMsg(stdoutResult);
            printTestFailMsg(stderrResult);
        }
        else {
            if (tobj.baselineFromRecord) {
                tobj.baseline = stdoutResult;

                //console.log('AutoGenBaseline:');
                //console.log(stdoutResult);
            }

            let wsre = new RegExp('\\s+', 'g'); 
            let tiNorm = tobj.baseline.replace(wsre, ' ');
            let soNorm = stdoutResult.replace(wsre, ' '); 

            success = (tiNorm === soNorm);
            if (!success) {
                printTestFailMsg('========');
                printTestFailMsg('Output:');
                printTestFailMsg(soNorm);
                printTestFailMsg('========');
                printTestFailMsg('Expected:');
                printTestFailMsg(tiNorm);
            }
        }

        cb(success);
    });

    shutDownId = setTimeout(function () {
        console.log('Killing process due to timeout!!!');
        cproc.kill();
    }, 10000);
}

let testPrototype = {
    'runRecord': function (cb, sinterval, hlength, driver) {
        console.log(`Running ${chalk.bold('Record')} Test for ${chalk.bold(this.name)} with History of ${hlength}...`)
        
        startup(cb, this, sinterval, hlength, driver);
    },
    'runReplay': function (cb) {
        console.log(`Running ${chalk.bold('Replay')} Test for ${chalk.bold(this.name)}...`)

        let cmd = `${this.nodeExePath} --nolazy -TTReplay:ttlog`;
        let options = {cwd: this.nodeExePath.dir().toString()};
        let baseline = this.baseline;

        cProcess.exec(cmd, options, function(error, stdout, stderr) {
            let success = false;
            if(error) {
                printTestFailMsg(JSON.stringify(error));
            }
            else {
                let wsre = new RegExp('\\s+', 'g'); 
                let bNorm = baseline.replace(wsre, ' ');
                let soNorm = stdout.toString().replace(wsre, ' '); 

                let startPos = (bNorm.length - soNorm.length);
                let bTail = bNorm.substr(startPos);

                success = (bTail.length > 0) && (bTail === soNorm);
                if(!success) {
                    printTestFailMsg('========');
                    printTestFailMsg('Output:');
                    printTestFailMsg(soNorm);
                    printTestFailMsg('========');
                    printTestFailMsg('Expected:');
                    printTestFailMsg(bTail);
                    printTestFailMsg('');
                }
            }

            cb(success);
        });
    }
}

exports.loadTest = function (nodeExePath, testDir) {
    let testName = testDir.basename();
    let exeFile = testDir.append('app.js');
    let baselineFile = testDir.append('baseline.txt');
    let driverfile = testDir.append('driver.js');

    assert(exeFile.isFile(), exeFile.toString());

    let baselineFromRecord = true;
    let baselineContents = undefined; 
    if(baselineFile.isFile()) {
        baselineFromRecord = false;

        baselineContents = baselineFile.read({sync: true, encoding: 'utf8'});
    }

    let driverObj = require(driverfile.toString()); 

    let obj = Object.create(testPrototype);
    obj.nodeExePath = nodeExePath; 
    obj.name = testName; 
    obj.dir = testDir; 
    obj.exeFile = exeFile; 
    obj.baselineFromRecord = baselineFromRecord;
    obj.baseline = baselineContents;
    obj.useDriver = true;
    obj.driver = driverObj.driver;

    return obj;
}
