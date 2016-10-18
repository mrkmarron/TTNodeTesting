var vm = require('vm');

var sandbox = {name: 'bob', ctr: 1};

function createNewContextTest(cb) {
    telemetryLog('createNewContextTest', true);

    vm.createContext(sandbox);

    cb();
}

function executeScriptInContextTestScalar(cb) {
    telemetryLog('executeScriptInContextTestScalar', true);

    for (var i = 0; i < 10; ++i) {
      vm.runInContext('ctr *= 2;', sandbox);
    }

    telemetryLog(JSON.stringify(sandbox), true);

    cb();
}

var namevar = null;
function executeScriptInContextTestObject(cb) {
    telemetryLog('executeScriptInContextTestObject', true);

    vm.runInContext('name = {first: "bob", last: "bobson"};', sandbox);
    namevar = sandbox.name;

    telemetryLog(JSON.stringify(sandbox), true);

    cb();
}

function checkNameVar(cb) {
    telemetryLog('checkNameVar', true);

    telemetryLog(JSON.stringify(namevar), true);

    cb();
}

function scriptInNewContextTest(cb) {
    telemetryLog('scriptInNewContextTest', true);

    const sandbox = { animal: 'cat', count: 2 };
    vm.runInNewContext('count += 1; name = "kitty"', sandbox);

    telemetryLog(JSON.stringify(sandbox), true);

    cb();
}

global.globalVar = 0;
function scriptInThisContextTest(cb) {
    telemetryLog('scriptInThisContextTest', true);

    let script = new vm.Script('globalVar += 1', { filename: 'myfile.vm' });
    for (var i = 0; i < 10; ++i) {
        script.runInThisContext();
    }

    telemetryLog(JSON.stringify(globalVar), true);

    cb();
}

////////

var wlPos = 0;
var worklist = [createNewContextTest, executeScriptInContextTestScalar, executeScriptInContextTestObject, checkNameVar, scriptInNewContextTest, scriptInThisContextTest, checkNameVar];

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