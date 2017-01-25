var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

console.log = function(msg) {
  telemetryLog(`${msg}`, true);
}

var jsome = require('jsome');
 
function basicTest(cb) {
    telemetryLog('Basic test', true);

    jsome([{"id":1,"email":"Khalid@Morocco.ma","active":true},{"id":2,"email":"Someone@somewhere.com","active":false,"nested":{"info": "yes","list":[1,"two",3]}},{"id":3,"email":"chinese@bamboo.tree","active":true}]);

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTest, basicTest, basicTest];

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