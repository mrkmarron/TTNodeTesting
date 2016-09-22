let assert = require('assert');
let cProcess = require('child_process');
let path = require('filepath');
let chalk = require('chalk');
let http = require('http');
let async = require('async');

function printTestFailMsg(msg) {
    console.log(chalk.bold.red(msg));
} 

function hardShutdown(tobj) {
    if (tobj.cproc) {
        tobj.cproc.kill();
        tobj.cproc = undefined;
    }

    if (tobj.waitServer) {
        tobj.waitServer.close();
        tobj.waitServer = undefined;
    }
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
        //console.log(`GET / => ${bodyi}`, true);

        async.waterfall(
        testArray,
        function () {
            doHttpGet('/exit', function (bodye) {
                //console.log(`GET /exit => ${bodye}`, true);
            });
        });
    });
}

function startup(cb, tobj, sinterval, hlength, driver) {
    async.series([
        //Setup a server that listens for a start msg from the test process
        function (callback) {
            console.log('Starting server...');
            tobj.waitServer = http.createServer(function (request, response) {
                if (tobj.timerId) {
                    clearTimeout(tobj.timerId);
                    tobj.timerId = undefined;
                }

                tobj.waitServer.close();
                tobj.waitServer = undefined;

                console.log('Handshake done!!!');

                driveTest(driver);
            });

            tobj.waitServer.listen(1338, function() {
                console.log('Server running...');
                callback(null);
            });
        },
        //Startup the test process 
        function (callback) {
            let cmd = `${tobj.nodeExePath} --nolazy -TTRecord:ttlog -TTSnapInterval:${sinterval} -TTHistoryLength:${hlength} ${tobj.exeFile}`;
            let options = { cwd: tobj.nodeExePath.dir().toString() };

            console.log('Starting process...');
            tobj.cproc = cProcess.exec(cmd, options, function (error, stdout, stderr) {
                let success = false;
                if (error) {
                    printTestFailMsg(JSON.stringify(error));
                }
                else {
                    if (tobj.baselineFromRecord) {
                        tobj.baseline = stdout;
                    }

                    success = (tobj.baseline === stdout);
                    if (!success) {
                        printTestFailMsg('========');
                        printTestFailMsg('Output:');
                        printTestFailMsg(stdout);
                        printTestFailMsg('========');
                        printTestFailMsg('Expected:');
                        printTestFailMsg(tobj.baseline);
                    }
                }

                cb(success);
            });

            tobj.timerId = setTimeout(function () {
                shutdown(tobj);
            }, 2000);

            callback(null);
        }
    ],
    function (err, results) {
        if (err) {
            console.log(JSON.stringify(err));
        }
    });
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
                let startPos = (baseline.length - stdout.length);
                let baseTail = baseline.substr(startPos);
                success = (baseTail.length > 0) && (baseTail === stdout);

                if(!success) {
                    printTestFailMsg('========');
                    printTestFailMsg('Output:');
                    printTestFailMsg(stdout);
                    printTestFailMsg('========');
                    printTestFailMsg('Expected:');
                    printTestFailMsg(baseline);
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
