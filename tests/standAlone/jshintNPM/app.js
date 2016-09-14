let jshint = require('jshint');

function basicTest(cb) {
    telemetryLog('Basic test', true);

    var source = [
        'function goo() {}',
        'foo = 3;'
    ];
    var options = {
        undef: true
    };
    var predef = {
        foo: false
    };

    jshint.JSHINT(source, options, predef);

    telemetryLog(`${JSON.stringify(jshint.JSHINT.data())}`, true); // ... 

    cb();
}

function nullCmpTest(cb) {
    telemetryLog('nullCmp test', true);

    var source = [
        'function main(a, b) {',
            'return a == null;',
        '}'
    ];

    jshint.JSHINT(source);

    telemetryLog(`${JSON.stringify(jshint.JSHINT.data())}`, true); // ... 

    cb();
}

function nullCmpWSuppressTest(cb) {
    telemetryLog('nullCmpWSuppress test', true);

    var source = [
        '/*jshint unused:true, eqnull:true */',
        'function main(a, b) {',
            'return a == null;',
        '}'
    ];

    jshint.JSHINT(source);

    telemetryLog(`${JSON.stringify(jshint.JSHINT.data())}`, true); // ... 

    cb();
}

function noDefaultSwitchTest(cb) {
    telemetryLog('noDefaultSwitch test', true);

    var source = [
        'function main(a, b) {',
            'var x = 0;',
            'switch (cond) {', 
            'case "one":',
                'x = 1;',
            'case "two":',
                'x = 1;',
            '}',
        '}'
    ];

    jshint.JSHINT(source);

    telemetryLog(`${JSON.stringify(jshint.JSHINT.data())}`, true); // ... 

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTest, nullCmpTest, nullCmpWSuppressTest, noDefaultSwitchTest];

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