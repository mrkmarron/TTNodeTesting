var pug = require('pug');

function renderStaticTest(cb) {
    telemetryLog('Basic test', true);

    var html = pug.renderFile(__dirname + '\\pugBasic.pug');
    telemetryLog(`${html}`, true); // ... 

    cb();
}

var compiledBasicFn = undefined;
function basicCompileTest(cb) {
    telemetryLog('Basic compile test', true);

    let tt = "p #{name}'s Pug source code!";
    compiledBasicFn = pug.compile(tt);

    cb();
}

function basicExecTest(cb) {
    telemetryLog('Basic execute test', true);

    let v1 = compiledBasicFn({name: 'Timothy'}); 
    telemetryLog(`${v1}`, true); // "<p>Timothy's Pug source code!</p>"

    let v2 = compiledBasicFn({name: 'Forbes'}); 
    telemetryLog(`${v2}`, true); // "<p>Forbes's Pug source code!</p>"

    cb();
}

var compiledLoopFn = undefined;
function loopCompileTest(cb) {
    telemetryLog('Loop compile test', true);

    compiledLoopFn = pug.compileFile(__dirname + '\\loopCode.pug');

    cb();
}

function loopExecTest(cb) {
    telemetryLog('Loop execute test', true);

    let v1 = compiledLoopFn({name: 'bananas'});
    telemetryLog(`${v1}`, true); // ...

    cb();
}

function renderIncludesTest(cb) {
    telemetryLog('Includes test', true);

    var html = pug.renderFile(__dirname + '\\index.pug');
    telemetryLog(`${html}`, true); // ... 

    cb();
}

function errorTest(cb) {
    telemetryLog('Error test', true);


    let tt = "p #{name's Pug source code!";
    try 
    {
        pug.compile(tt);
    }
    catch(e)
    {
        telemetryLog(`${e}`, true);
    }

    cb();
}

////////

var wlPos = 0;
var worklist = [renderStaticTest, basicCompileTest, basicExecTest, loopCompileTest, loopExecTest, renderIncludesTest, errorTest];

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