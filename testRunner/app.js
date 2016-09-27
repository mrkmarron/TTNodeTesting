let assert = require('assert');
let fs = require('fs');
let path = require('filepath');
let chalk = require('chalk');

let saTest = require('./standAloneTest');
let hTest = require('./httpTest');

//let nodePath = path.create('C:\\Chakra\\TTNodeDebug\\Debug\\node.exe');
let nodePath = path.create('C:\\Chakra\\TTNode1_3\\Debug\\node.exe');

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
    {path: 'asyncNPM', hlCount: [5, 100], sinterval:0},
    {path: 'asyncNonDetNPM', hlCount: [3, 100], sinterval:0},
    {path: 'bluebirdNPM', hlCount: [3, 100], sinterval:0},
    {path: 'chalkNPM', hlCount: [3, 100], sinterval:0},
    {path: 'cheerioNPM', hlCount: [5, 100], sinterval:0},
    {path: 'commanderNPM', hlCount: [5, 100], sinterval:0},
    {path: 'debugNPM', hlCount: [3, 100], sinterval:0},
    {path: 'eslintNPM', hlCount: [3, 100], sinterval:0},
    {path: 'fsextraNPM', hlCount: [5, 100], sinterval:0},
    {path: 'jsdomNPM', hlCount: [3, 100], sinterval:0, warn: 'Needs multi-context support & es6 generator functions + blocked on Chakra OOS. Also add jQuery once this runs.'},
    {path: 'jshintNPM', hlCount: [3, 100], sinterval:0},
    {path: 'jsomeNPM', hlCount: [3, 100], sinterval:0},
    {path: 'markedNPM', hlCount: [3, 100], sinterval:0},
    {path: 'minimistNPM', hlCount: [3, 100], sinterval:0},
    {path: 'momentNPM', hlCount: [3, 100], sinterval:0},
    {path: 'pdfkitNPM', hlCount: [35, 100], sinterval:0},
    {path: 'pugNPM', hlCount: [5, 100], sinterval:0},
    {path: 'random', hlCount: [4, 100], sinterval:0},
    {path: 'uglify-js2NPM', hlCount: [4, 100], sinterval:0, warn: 'Needs multi-context support'},
    {path: 'winstonNPM', hlCount: [4, 100], sinterval:0},
    {path: 'zlib', hlCount: [4, 100], sinterval:0}
];

let httpTests = [
    {path: 'bodyparserNPM', hlCount: [5, 100], sinterval:0},
    {path: 'expressNPM', hlCount: [4, 100], sinterval:0},
    {path: 'http', hlCount: [3, 100], sinterval:0},
    {path: 'httpproxyNPM', hlCount: [4, 100], sinterval:0},
    {path: 'morganNPM', hlCount: [4, 100], sinterval:0},
    {path: 'requestNPM', hlCount: [5, 100], sinterval:0},
    {path: 'rockyNPM', hlCount: [4, 100], sinterval:0}
];

//for debugging a single test
//standAloneTests = [{path: 'eslintNPM', hlCount: [3, 100], sinterval:0}];
//httpTests = [{path: 'morganNPM', hlCount: [4, 100], sinterval:0}];

function LoadAllStandAloneTests() {
    let rootPath = path.create(__dirname).resolve('..\\tests\\standAlone\\');

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
    let rootPath = path.create(__dirname).resolve('..\\tests\\http\\');

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

        if(cTask.warn !== undefined) {
            console.log(`Skipping Test for ${chalk.bold(cTask.task.name)}...`)
            console.log(chalk.bold.yellow('Warn: ' + cTask.warn));

            currentTask++;
            setImmediate(ProcessWork);
        }
        else {
            if (cTask.nextAction === TaskStateFlag.record) {
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
