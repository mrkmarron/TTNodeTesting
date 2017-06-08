const assert = require('assert');
const path = require('path');
const cProcess = require('child_process');
const fsExtra = require('fs-extra');

function BaseTest(nodeExePath, testDir, sInterval, hLength, baselineEncoding) {
    this._nodeExePath = nodeExePath;
    this._dir = testDir;
    this._sInterval = sInterval;
    this._hLength = hLength;
    this._state = BaseTest.State.none;
    this._result = BaseTest.Result.none;
    this._log = "";
    
    this._name = testDir.basename();
    this._exeFile = testDir.append('app.js');

    assert(this._exeFile.isFile(), this._exeFile.toString());

    this._baselineFromRecord = true;
    this._baseline = undefined;
    
    let baselineFile = testDir.append('baseline.txt');
    if(baselineFile.isFile()) {
        this._baselineFromRecord = false;
        this._baseline = baselineFile.read({
            sync: true,
            encoding: baselineEncoding || 'utf8'
        });
    }
}

BaseTest.Result = {
    none: 'none',
    pass: 'pass',
    fail: 'fail',
    skip: 'skip'
};

BaseTest.State = {
    none: 'none',
    record: 'record',
    replay: 'replay',
    done: 'done'
};

BaseTest.normalizeWhiteSpace = function (str) {
    if (!BaseTest._whiteSpaceRegex) {
        BaseTest._whiteSpaceRegex = new RegExp('\\s+', 'g');
    }

    return str.replace(BaseTest._whiteSpaceRegex, ' ');
};

BaseTest.sanitizeReplayOutput = function (str) {
    return str.replace('Reached end of Execution -- Exiting.', '');
};

BaseTest.getRecordDir = function () {
    return path.normalize(
        `${__dirname}${path.sep}..${path.sep}..${path.sep}_logDir${path.sep}`);
};

BaseTest.clearRecordDir = function () {
    let recordDir = BaseTest.getRecordDir();

    fsExtra.ensureDirSync(recordDir);
    fsExtra.emptyDirSync(recordDir);
};

BaseTest.prototype.getState = function () {
    return this._state;
};

BaseTest.prototype.getResult = function () {
    return this._result;
};

BaseTest.prototype.getLog = function () {
    return this._log;
};

BaseTest.prototype.getFullName = function () {
    return `${this._name} - History: ${this._hLength}, Interval: ${this._sInterval}`;
};

BaseTest.prototype.skip = function (message) {
    this._appendLog(message);
    this._setResult(BaseTest.Result.skip);
};

BaseTest.prototype.runRecord = function (callback, state) {
    callback(this, state);
};

BaseTest.prototype.runReplay = function (callback, state) {
    assert(this._state === BaseTest.State.record);
    this._state = BaseTest.State.replay;

    this._appendLog(`Running replay: "${this.getFullName()}"`);

    let cmd = `${this._nodeExePath} --nolazy --replay=${BaseTest.getRecordDir()}`;
    let options = {cwd: this._nodeExePath.dir().toString()};

    cProcess.exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
            this._appendLog(`stderr: ${stderr}`);
            this._appendLog(`stdout: ${stdout}`);
            this._appendLog(JSON.stringify(error));

            this._setResult(BaseTest.Result.fail);
        } else {
            let bNorm = BaseTest.normalizeWhiteSpace(this._baseline);
            let soNorm = BaseTest.sanitizeReplayOutput(stdout.toString());
            soNorm = BaseTest.normalizeWhiteSpace(soNorm);

            let startPos = (bNorm.length - soNorm.length);
            let bTail = bNorm.substr(startPos);

            if (bTail.length > 0 && bTail === soNorm) {
                this._setResult(BaseTest.Result.pass);
            } else {
                this._appendLog('========');
                this._appendLog('Output:');
                this._appendLog(soNorm);
                this._appendLog('========');
                this._appendLog('Expected:');
                this._appendLog(bTail);
                this._appendLog('');

                this._setResult(BaseTest.Result.fail);
            }
        }

        callback(this, state);
    });
};

BaseTest.prototype._appendLog = function (message) {
    if (!this._log) {
        this._log = message;
    } else {
        this._log += '\n' + message;
    }
};

BaseTest.prototype._setResult = function (result) {
    assert(this._state !== BaseTest.State.done);
    assert(this._result === BaseTest.Result.none);

    this._state = BaseTest.State.done;
    this._result = result;
};

module.exports = BaseTest;
