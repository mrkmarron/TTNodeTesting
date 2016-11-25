var zlib = require("zlib");

var rawText = `Hello World! -- ${new Date('September 12, 2016 11:06:00').toISOString()}`;
var compressedText = undefined;

function compressDataTest(cb) {
    telemetryLog('Testing compress', true);

    zlib.deflate(rawText, (err, buffer) => {
        if (!err) {
            telemetryLog('Compress ok', true);
            telemetryLog(buffer.length.toString(), true);
            telemetryLog(buffer[0].toString(), true);

            compressedText = buffer.toString('base64');
            telemetryLog(compressedText, true);
        } else {
            telemetryLog('error', true);
        }

        cb();
    });
}

function extractDataTest(cb) {
    telemetryLog('Testing decompress', true);

    var buffer = Buffer.from(compressedText, 'base64');
    telemetryLog(buffer.length.toString(), true);
    telemetryLog(buffer[0].toString(), true);

    zlib.unzip(buffer, (err, newbuffer) => {
        if (!err) {
            telemetryLog('Decompress ok', true);
            telemetryLog(newbuffer.length.toString(), true);
            telemetryLog(newbuffer[0].toString(), true);

            origText = newbuffer.toString();
            telemetryLog(origText, true);
        } else {
            telemetryLog('error', true);
        }

        cb();
    });
}

function extractDataFailTest(cb) {
    telemetryLog('Testing decompress that fails', true);

    var buffer = Buffer.from(rawText, 'base64');
    telemetryLog(buffer.length.toString(), true);
    telemetryLog(buffer[0].toString(), true);

    zlib.unzip(buffer, (err, newbuffer) => {
        if (!err) {
            telemetryLog('Decompress ok', true);
            telemetryLog(newbuffer.length.toString(), true);
            telemetryLog(newbuffer[0].toString(), true);

            origText = newbuffer.toString();
            telemetryLog(origText, true);
        } else {
            telemetryLog('error', true);
        }

        cb();
    });
}

////////

var wlPos = 0;
var worklist = [compressDataTest, extractDataTest, extractDataFailTest];

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

