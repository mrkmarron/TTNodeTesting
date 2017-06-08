const assert = require('assert');
const cProcess = require('child_process');
const util = require('util');

const BaseTest = require('./base-test');

function StandAloneTest(nodeExePath, testDir, sInterval, hLength, baselineEncoding) {
    BaseTest.apply(this, arguments);
}

util.inherits(StandAloneTest, BaseTest);

StandAloneTest.prototype.runRecord = function (callback, state) {
    assert(this._state === BaseTest.State.none);
    this._state = BaseTest.State.record;

    this._appendLog(`Running record: "${this.getFullName()}"`);

    let cmd = `${this._nodeExePath} --nolazy --record --record-interval=${this._sInterval} --record-history=${this._hLength} ${this._exeFile}`;
    let options = { cwd: this._nodeExePath.dir().toString() };

    var child = cProcess.exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
            this._appendLog(`stderr: ${stderr}`);
            this._appendLog(`stdout: ${stdout}`);
            this._appendLog(JSON.stringify(error));

            this._setResult(BaseTest.Result.fail);
        } else {
            if(this._baselineFromRecord) {
                this._baseline = stdout.toString();
            }

            let tiNorm = BaseTest.normalizeWhiteSpace(this._baseline);
            let soNorm = BaseTest.normalizeWhiteSpace(stdout.toString());

            if(tiNorm !== soNorm) {
                this._appendLog('========');
                this._appendLog('Output:');
                this._appendLog(soNorm);
                this._appendLog('========');
                this._appendLog('Expected:');
                this._appendLog(tiNorm);

                this._setResult(BaseTest.Result.fail);
            }
        }

        callback(this, state);
    });
};

module.exports = StandAloneTest;
