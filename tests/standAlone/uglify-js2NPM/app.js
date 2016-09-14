var UglifyJS = require("uglify-js2");

function uglify(cb) {
    telemetryLog('Uglify', true);

    var result = UglifyJS.minify(__filename, {mangle: false});
    telemetryLog(result.code, true);

    cb();
}

function uglifyAndMangle(cb) {
    telemetryLog('Uglify and Compress', true);

    var result = UglifyJS.minify(__filename);
    telemetryLog(result.code, true);

    cb();
}

////////

var wlPos = 0;
var worklist = [uglify, uglifyAndMangle, uglify, uglifyAndMangle];

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