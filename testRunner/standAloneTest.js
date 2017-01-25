
let assert = require('assert');
let cProcess = require('child_process');
let path = require('filepath');
let cpath = require('path');
let chalk = require('chalk');

function printTestFailMsg(msg) {
    console.log(chalk.bold.red(msg));
} 

let testPrototype = {
    'runRecord': function (cb, sinterval, hlength) {
        console.log(`Running ${chalk.bold('Record')} Test for ${chalk.bold(this.name)} with History of ${hlength}...`)

        let cmd = `${this.nodeExePath} --nolazy --record --record-interval=${sinterval} --record-history=${hlength} ${this.exeFile}`;
        let options = {cwd: this.nodeExePath.dir().toString()};
        let testInfo = this;

        cProcess.exec(cmd, options, function(error, stdout, stderr) {
            let success = false;
            if(error) {
                console.log(`stderr: ${stderr}`);
                console.log(`stdout: ${stdout}`);
                printTestFailMsg(JSON.stringify(error));
            }
            else {
                if(testInfo.baselineFromRecord) {
                    testInfo.baseline = stdout.toString();
                }

                let wsre = new RegExp('\\s+', 'g'); 
                let tiNorm = testInfo.baseline.replace(wsre, ' ');
                let soNorm = stdout.toString().replace(wsre, ' '); 

                success = (tiNorm === soNorm);
                if(!success) {
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
    },
    'runReplay': function (cb) {
        console.log(`Running ${chalk.bold('Replay')} Test for ${chalk.bold(this.name)}...`)

        let logdir = cpath.normalize(__dirname + cpath.sep + '..' + cpath.sep + '_logDir' + cpath.sep);
        let cmd = `${this.nodeExePath} --nolazy --replay=${logdir}`;
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
                let soNorm = stdout.toString().replace('Reached end of Execution -- Exiting.', '').replace(wsre, ' '); 

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

    let obj = Object.create(testPrototype);
    obj.nodeExePath = nodeExePath; 
    obj.name = testName; 
    obj.dir = testDir; 
    obj.exeFile = exeFile; 
    obj.baselineFromRecord = baselineFromRecord;
    obj.baseline = baselineContents;

    return obj;
}
