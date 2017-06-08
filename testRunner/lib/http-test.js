const assert = require('assert');
const async = require('async');
const cProcess = require('child_process');
const http = require('http');
const util = require('util');

const BaseTest = require('./base-test');

function HttpTest(nodeExePath, testDir, baselineEncoding, sInterval, hLength) {
    BaseTest.apply(this, arguments);
    
    let driverfile = testDir.append('driver.js');
    let driverObj = require(driverfile.toString());

    this._driver = driverObj.driver;
}

util.inherits(HttpTest, BaseTest);

HttpTest._doHttpGet = function (url, callback) {
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

    var httpreq = http.request(options, (res) => {
        var responseString = '';

        res.on("data", (data) => {
            responseString += data;
        });

        res.on("end", () => {
            callback(responseString);
        });
    });

    httpreq.end();
}

HttpTest._driveTest = function (testArray) {
    HttpTest._doHttpGet('/', (bodyi) => {
        async.waterfall(testArray, () => {
            HttpTest._doHttpGet('/exit', (bodye) => { });
        });
    });
}

HttpTest.prototype.runRecord = function (callback, state) {
    assert(this._state === BaseTest.State.none);
    this._state = BaseTest.State.record;

    this._appendLog(`Running record: "${this.getFullName()}"`);

    let cmd = this._nodeExePath.toString();
    let args = [
        '--nolazy',
        '--record',
        `--record-interval=${this._sInterval}`,
        `--record-history=${this._hLength}`,
        this._exeFile.toString()
    ];
    let options = { cwd: this._nodeExePath.dir().toString() };

    let hasError = false;
    let stdoutResult;
    let stderrResult;
    let shutDownId;

    let cproc = cProcess.spawn(cmd, args, options);

    cproc.on('error', function(err) {
        hasError = true;
        this._appendLog(JSON.stringify(err));
    });

    cproc.stdout.on('data', (data) => {
        if (!stdoutResult) {
            stdoutResult = '';

            if (shutDownId !== undefined) {
                clearTimeout(shutDownId);
                shutDownId = undefined;
            }

            HttpTest._driveTest(this._driver);
        }

        stdoutResult += data;
    });

    cproc.stderr.on('data', (data) => {
        if (!stderrResult) {
            stderrResult = '';
        }

        stderrResult += data;
    });

    cproc.on('close', (code) => {
        if (code !== 0 || hasError) {
            this._appendLog(stdoutResult);
            this._appendLog(stderrResult);

            this._setResult(BaseTest.Result.fail);
        } else {
            if (this._baselineFromRecord) {
                this._baseline = stdoutResult;
            }

            let tiNorm = BaseTest.normalizeWhiteSpace(this._baseline);
            let soNorm = BaseTest.normalizeWhiteSpace(stdoutResult);

            if (tiNorm !== soNorm) {
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

    shutDownId = setTimeout(() => {
        this._appendLog('Killing process due to timeout!!!');
        cproc.kill();
    }, 10000);
};

module.exports = HttpTest;
