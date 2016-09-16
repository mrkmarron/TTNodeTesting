let assert = require('assert');
let path = require('filepath');
let chalk = require('chalk');

let saTest = require('./standAloneTest');

let nodePath = path.create('C:\\Chakra\\TTNodeDebug\\Debug\\node.exe');

const TaskStateFlag = {
    record: 'record',
    replay: 'replay',
    done: 'done'
}

let taskList = [];
let currentTask = 0;
let passing = 0;
let failing = 0;

let standAloneTests = [
    {path: 'cheerioNPM', hlCount: [5, 100], sinterval:0},
    {path: 'commanderNPM', hlCount: [5, 100], sinterval:0},
    {path: 'eslintNPM', hlCount: [3, 100], sinterval:0},
    // {path: 'jsdomNPM', hlCount: [3, 100], sinterval:0}, -- needs multi-context support & es6 generator functions + blocked on Chakra OOS
    {path: 'jshintNPM', hlCount: [3, 100], sinterval:0},
    {path: 'jsomeNPM', hlCount: [3, 100], sinterval:0},
    {path: 'markedNPM', hlCount: [3, 100], sinterval:0},
    {path: 'pugNPM', hlCount: [5, 100], sinterval:0},
    {path: 'random', hlCount: [4, 100], sinterval:0},
    // {path: 'uglify-js2NPM', hlCount: [4, 100], sinterval:0}, -- needs multi-context support
    {path: 'zlib', hlCount: [4, 100], sinterval:0}
];

//for debugging a single test
//standAloneTests = [{path: 'jsomeNPM', hlCount: [3, 100], sinterval:0}];

function LoadAllStandAloneTests() {
    let rootPath = path.create(__dirname).resolve('..\\tests\\standAlone\\');

    for(var i = 0; i < standAloneTests.length; ++i) {
        let ctest = standAloneTests[i];

        let sp = rootPath.append(ctest.path);
        let st = saTest.loadTest(nodePath, sp);
        taskList.push({task: st, nextAction: TaskStateFlag.record, hlCount: ctest.hlCount, sinterval: ctest.sinterval});
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
}

function ProcessSingleResult(success) {
    if (success) {
        passing++;
        console.log(chalk.green('passed'));
    }
    else {
        failing++;
        console.log(chalk.bold.red('failed'));
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

        if(cTask.nextAction === TaskStateFlag.record) {
            cTask.task.runRecord(ProcessSingleResult, cTask.sinterval, cTask.hlCount.pop());
        }
        else {
            assert(cTask.nextAction === TaskStateFlag.replay);
            cTask.task.runReplay(ProcessSingleResult);    
        }
    }
}

////////

LoadAllStandAloneTests();

ProcessWork();
