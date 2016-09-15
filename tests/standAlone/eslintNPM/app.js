let eslint = require('eslint');

function basicTestClean(cb) {
    telemetryLog('Basic test clean', true);

    var messages = eslint.linter.verify("var foo;",
        { rules: { semi: 2 } },
        { filename: "foo.js" }
    );

    telemetryLog(`${JSON.stringify(messages)}`, true); // ... 

    cb();
}

function basicTestReport(cb) {
    telemetryLog('Basic test warn', true);

    var messages = eslint.linter.verify("var foo; var bar",
        { rules: { semi: 2 } },
        { filename: "foo.js" }
    );

    telemetryLog(`${JSON.stringify(messages)}`, true); // ... 

    cb();
}

function singleFileTestClean(cb) {
    telemetryLog('Basic file clean', true);

    var cli = new eslint.CLIEngine({
        envs: ["browser", "mocha"],
        useEslintrc: false,
        rules: { semi: 2, curly: 2, eqeqeq: 2 }
    });

    var messages = cli.executeOnFiles([__dirname + "\\clean.js"]);

    telemetryLog(`${JSON.stringify(messages)}`, true); // ... 

    cb();
}

function singleFileTestReport(cb) {
    telemetryLog('Basic file warn', true);

    var cli = new eslint.CLIEngine({
        envs: ["browser", "mocha"],
        useEslintrc: false,
        rules: { semi: 2, curly: 2, eqeqeq: 2 }
    });

    var messages = cli.executeOnFiles([__dirname + "\\report.js"]);

    telemetryLog(`${JSON.stringify(messages)}`, true); // ...  

    cb();
}

function combinedFileTest(cb) {
    telemetryLog('Multiple file test', true);

    var cli = new eslint.CLIEngine({
        envs: ["browser", "mocha"],
        useEslintrc: false,
        rules: { semi: 2, curly: 2, eqeqeq: 2 }
    });

    var messages = cli.executeOnFiles([__dirname + "\\clean.js", __dirname + "\\report.js"]);

    telemetryLog(`${JSON.stringify(messages)}`, true); // ...  

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTestClean, basicTestReport, singleFileTestClean, singleFileTestReport, combinedFileTest];

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