var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var program = require('commander');
 
program
  .version('0.0.1')
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  .option('-T, --no-tests', 'ignore test hook')
 
program
  .command('setup [env]')
  .description('run setup commands for all envs')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function(env, options){
    var mode = options.setup_mode || "normal";
    env = env || 'all';
    telemetryLog(`setup for ${env} env(s) with ${mode} mode`, true);
  });
 
program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option("-e, --exec_mode <mode>", "Which exec mode to use")
  .action(function(cmd, options){
    telemetryLog(`exec ${cmd} using ${options.exec_mode} mode`, true);
  }).on('--help', function() {
    telemetryLog('  Examples:', true);
    telemetryLog('', true);
    telemetryLog('    $ deploy exec sequential', true);
    telemetryLog('    $ deploy exec async', true);
    telemetryLog('', true);
  });
 
program
  .command('*')
  .action(function(env){
    telemetryLog(`deploying ${env}`, true);
  });

function cmdExec1(cb) {
    telemetryLog('Exec', true);

    program.parse(['node.exe', 'app.js', 'exec', 'hello']);
    cb();
}

function cmdExec2(cb) {
    telemetryLog('Exec2', true);

    program.parse(['node.exe', 'app.js', 'exec', 'hello', '-e', 'j']);
    cb();
}

function cmdStar(cb) {
    telemetryLog('Star', true);

    program.parse(['node.exe', 'app.js', 'setup', 'normal']);
    cb();
}

////////

var wlPos = 0;
var worklist = [cmdExec1, cmdStar, cmdStar, cmdExec2, cmdExec2];

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