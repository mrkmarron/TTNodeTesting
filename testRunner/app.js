let assert = require('assert');
let fs = require('fs');
let fsExtra = require('fs-extra');
let cpath = require('path');
let path = require('filepath');
let chalk = require('chalk');
let program = require('commander');

let saTest = require('./standAloneTest');
let hTest = require('./httpTest');

program
    .option('-n, --node <node>', 'The path to the node executable',)
    .parse(process.argv);

if (!program.node) {
    console.error(`Node path must be specified`);
    process.exit(1);
}

let nodePath = path.create(program.node);
console.log(`Node path is: "${nodePath}"`);

const TaskStateFlag = {
    record: 'record',
    replay: 'replay',
    done: 'done'
}

let taskList = [];
let currentTask = 0;
let passing = 0;
let failing = 0;

let moduleSet = new Set();

let standAloneTests = [
    {path: 'asyncNPM', hlCount: [6, 100], sinterval:0},
    {path: 'asyncNonDetNPM', hlCount: [4, 100], sinterval:0},
    {path: 'bunyanNPM', hlCount: [5, 100], sinterval:0},
    {path: 'bluebirdNPM', hlCount: [4, 100], sinterval:0},
    {path: 'chalkNPM', hlCount: [4, 100], sinterval:0},
    {path: 'cheerioNPM', hlCount: [6, 100], sinterval:0},
    {path: 'commanderNPM', hlCount: [6, 100], sinterval:0},
    {path: 'debugNPM', hlCount: [4, 100], sinterval:0},
    {path: 'eslintNPM', hlCount: [4, 100], sinterval:0},
    {path: 'fs', hlCount: [5, 100], sinterval:0},
    {path: 'fsextraNPM', hlCount: [6, 100], sinterval:0},
    {path: 'jsdomNPM', hlCount: [4, 100], sinterval:0, warn: 'Needs es6 generator functions. Also add jQuery once this runs.'},
    {path: 'jshintNPM', hlCount: [4, 100], sinterval:0},
    {path: 'jsomeNPM', hlCount: [4, 100], sinterval:0},
    {path: 'markedNPM', hlCount: [4, 100], sinterval:0},
    {path: 'minimistNPM', hlCount: [4, 100], sinterval:0},
    {path: 'momentNPM', hlCount: [4, 100], sinterval:0},
    {path: 'pdfkitNPM', hlCount: [36, 100], sinterval:0},
    {path: 'pugNPM', hlCount: [6, 100], sinterval:0},
    {path: 'random', hlCount: [5, 100], sinterval:0},
    {path: 'reactbasicNPM', hlCount: [4, 100], sinterval:0},
    {path: 'uglify-js2NPM', hlCount: [5, 100], sinterval:0},
    {path: 'vm', hlCount: [5, 100], sinterval:0},
    {path: 'winstonNPM', hlCount: [5, 100], sinterval:0},
    {path: 'zlib', hlCount: [5, 100], sinterval:0}
];

let httpTests = [
    {path: 'bodyparserNPM', hlCount: [6, 100], sinterval:0},
    {path: 'expressNPM', hlCount: [5, 100], sinterval:0},
    {path: 'http', hlCount: [4, 100], sinterval:0},
    {path: 'httpproxyNPM', hlCount: [5, 100], sinterval:0},
    {path: 'morganNPM', hlCount: [5, 100], sinterval:0},
    {path: 'reactwebNPM', hlCount: [5, 100], sinterval:0},
    {path: 'requestNPM', hlCount: [6, 100], sinterval:0},
    {path: 'rockyNPM', hlCount: [5, 100], sinterval:0}
];

//for debugging a single test
//standAloneTests = [{path: 'fs', hlCount: [6, 100], sinterval:0}];
//httpTests = [{path: 'reactwebNPM', hlCount: [5, 100], sinterval:0}];

function LoadAllStandAloneTests() {
    let rootPath = path.create(__dirname).resolve('..' + cpath.sep + 'tests' + cpath.sep + 'standAlone' + cpath.sep);

    for(let i = 0; i < standAloneTests.length; ++i) {
        let ctest = standAloneTests[i];

        let sp = rootPath.append(ctest.path);
        let st = saTest.loadTest(nodePath, sp);

        let modulePath = sp.append('node_modules').path;
        if(fs.existsSync(modulePath) && ctest.warn === undefined) {
            let npmModules = fs.readdirSync(modulePath);
            for (let j = 0; j < npmModules.length; ++j) {
                if (!npmModules[j].startsWith('.')) {
                    moduleSet.add(npmModules[j]);
                }
            }
        }

        let ttask = {task: st, nextAction: TaskStateFlag.record, hlCount: ctest.hlCount, sinterval: ctest.sinterval};
        if(ctest.warn !== undefined) {
            ttask.warn = ctest.warn;
        }

        taskList.push(ttask);
    }
}

function LoadAllHttpTests() {
    let rootPath = path.create(__dirname).resolve('..' + cpath.sep + 'tests' + cpath.sep + 'http' + cpath.sep);

    for(let i = 0; i < httpTests.length; ++i) {
        let ctest = httpTests[i];

        let sp = rootPath.append(ctest.path);
        let st = hTest.loadTest(nodePath, sp);

        let modulePath = sp.append('node_modules').path;
        if(fs.existsSync(modulePath) && ctest.warn === undefined) {
            let npmModules = fs.readdirSync(modulePath);
            for (let j = 0; j < npmModules.length; ++j) {
                if (!npmModules[j].startsWith('.')) {
                    moduleSet.add(npmModules[j]);
                }
            }
        }

        let ttask = {
            task: st, 
            nextAction: TaskStateFlag.record, 
            hlCount: ctest.hlCount, 
            sinterval: ctest.sinterval, 
            hasDriver: st.hasDriver, 
            driver: st.driver
        };

        if(ctest.warn !== undefined) {
            ttask.warn = ctest.warn;
        }

        taskList.push(ttask);
    }
}

function ReportResults() {
    console.log('');
    console.log('++++++++++++');

    if(failing == 0) {
        console.log(chalk.bold.green(`Passed all ${passing} tests!`));
    }
    else {
        console.log(chalk.bold.green(`Passed ${passing} tests.`));
        console.log(chalk.bold.red(`Failed ${failing} tests.`));
    }

    let moduleArray = Array.from(moduleSet);
    moduleArray.sort();

    let mPath = path.create(__dirname).append('moduleList.txt').path;
    let mList = moduleArray.join('\n');
    fs.writeFileSync(mPath, mList);

    console.log('');
    console.log(`Total packages tested: ${taskList.length}.`);
    console.log(`Total modules: ${moduleArray.length}.`);
    console.log('Full module list written to moduleList.txt.');
}

function ProcessSingleResult(success) {
    if (success) {
        passing++;
        console.log(chalk.green('Passed'));
    }
    else {
        failing++;
        console.log(chalk.bold.red('Failed'));
    }

    let cTask = taskList[currentTask];
    if(cTask.nextAction === TaskStateFlag.record) {
        if(success) {
            cTask.nextAction = TaskStateFlag.replay;
        }
        else {
            cTask.nextAction = TaskStateFlag.done;
            currentTask++;
        }
    }
    else {
        assert(cTask.nextAction === TaskStateFlag.replay);

        if(cTask.hlCount.length !== 0) {
            cTask.nextAction = TaskStateFlag.record; 
        }
        else {
            cTask.nextAction = TaskStateFlag.done;
            currentTask++;
        }
    }

    setImmediate(ProcessWork);
}

function ProcessWork() {
    if(currentTask === taskList.length) {
        ReportResults();
    }
    else {
        let cTask = taskList[currentTask];

        let logdir = cpath.normalize(__dirname + cpath.sep + '..' + cpath.sep + '_logDir' + cpath.sep);
        fsExtra.ensureDirSync(logdir);

        if(cTask.warn !== undefined) {
            console.log(`Skipping Test for ${chalk.bold(cTask.task.name)}...`)
            console.log(chalk.bold.yellow('Warn: ' + cTask.warn));

            currentTask++;
            setImmediate(ProcessWork);
        }
        else {
            if (cTask.nextAction === TaskStateFlag.record) {
                fsExtra.emptyDirSync(logdir);

                if(cTask.task.useDriver) {
                    cTask.task.runRecord(ProcessSingleResult, cTask.sinterval, cTask.hlCount.pop(), cTask.task.driver);
                }
                else {
                    cTask.task.runRecord(ProcessSingleResult, cTask.sinterval, cTask.hlCount.pop());
                }
            }
            else {
                assert(cTask.nextAction === TaskStateFlag.replay);
                cTask.task.runReplay(ProcessSingleResult);
            }
        }
    }
}

////////

LoadAllStandAloneTests();
LoadAllHttpTests();

ProcessWork();
