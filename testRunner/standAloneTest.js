
let assert = require('assert');
let cProcess = require('child_process');
let path = require('filepath');
let chalk = require('chalk');

function printTestFailMsg(msg) {
    console.log(chalk.bold.red(msg));
} 

let testPrototype = {
    'runRecord': function (cb, sinterval, hlength) {
        console.log(`Running ${chalk.bold('Record')} Test for ${chalk.bold(this.name)} with History of ${hlength}...`)

        let cmd = `${this.nodeExePath} --nolazy -TTRecord:ttlog -TTSnapInterval:${sinterval} -TTHistoryLength:${hlength} ${this.exeFile}`;
        let options = {cwd: this.nodeExePath.dir().toString()};
        let testInfo = this;

        cProcess.exec(cmd, options, function(error, stdout, stderr) {
            let success = false;
            if(error) {
                printTestFailMsg(JSON.stringify(error));
            }
            else {
                if(testInfo.baselineFromRecord) {
                    testInfo.baseline = stdout;
                }
                
                success = (testInfo.baseline === stdout);
                if(!success) {
                    printTestFailMsg('========');
                    printTestFailMsg('Output:');
                    printTestFailMsg(stdout);
                    printTestFailMsg('========');
                    printTestFailMsg('Expected:');
                    printTestFailMsg(testInfo.baseline);
                }
            }

            cb(success);
        });
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

exports.loadTest = function (nodeExePath, testDir, baselineEncoding) {
    let testName = testDir.basename();
    let exeFile = testDir.append('app.js');
    let baselineFile = testDir.append('baseline.txt');

    assert(exeFile.isFile(), exeFile.toString());

    let baselineFromRecord = true;
    let baselineContents = undefined; 
    if(baselineFile.isFile()) {
        baselineFromRecord = false;

        let benc = baselineEncoding || 'utf8';
        baselineContents = baselineFile.read({sync: true, encoding: benc});
    }

    let pInfo = {
        nodeExePath: {value: nodeExePath}, 
        name: {value: testName}, 
        dir: {value: testDir}, 
        exeFile: {value: exeFile}, 
        baselineFromRecord: {value: baselineFromRecord},
        baseline: {value: baselineContents, writable: true}
    };

    return Object.create(testPrototype, pInfo);
}
