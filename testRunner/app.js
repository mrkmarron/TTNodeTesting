const assert = require('assert');
const chalk = require('chalk');
const cpath = require('path');
const fs = require('fs');
const path = require('filepath');
const program = require('commander');

const BaseTest = require('./lib/base-test');
const StandAloneTest = require('./lib/stand-alone-test');
const HttpTest = require('./lib/http-test');

program
    .option('-n, --node <path>', 'Path to the node executable')
    .option('-x, --junit [path]', 'Output results in junit xml with optional file path')
    .parse(process.argv);

let nodePath = path.create(program.node ? program.node : process.execPath);

if(!fs.existsSync(nodePath.toString())) {
    console.error(`Invalid node path: "${nodePath}"`);
    process.exit(1);
}

console.log(`Node path is: "${nodePath}"`);

let taskList = [];
let currentTask = 0;
let passing = 0;
let skipped = 0;
let failing = 0;

let moduleSet = new Set();

const standAloneTests = [
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

const httpTests = [
    {path: 'bodyparserNPM', hlCount: [6, 100], sinterval:0},
    {path: 'expressNPM', hlCount: [5, 100], sinterval:0},
    {path: 'http', hlCount: [4, 100], sinterval:0},
    {path: 'httpproxyNPM', hlCount: [5, 100], sinterval:0},
    {path: 'morganNPM', hlCount: [5, 100], sinterval:0},
    {path: 'reactwebNPM', hlCount: [5, 100], sinterval:0},
    {path: 'requestNPM', hlCount: [6, 100], sinterval:0},
    {path: 'rockyNPM', hlCount: [5, 100], sinterval:0}
];

// for debugging a single test
////standAloneTests = [{path: 'fs', hlCount: [6, 100], sinterval:0}];
////httpTests = [{path: 'reactwebNPM', hlCount: [5, 100], sinterval:0}];

function logModules(testDir) {
    let modulePath = testDir.append('node_modules').path;
    if (fs.existsSync(modulePath)) {
        fs.readdirSync(modulePath).forEach((npmModule) => {
            if (!npmModule.startsWith('.')) {
                moduleSet.add(npmModule);
            }
        });
    }
}

function LoadTests(subDir, testList, testClass) {
    let rootPath = path.create(__dirname).resolve(
        `..${cpath.sep}tests${cpath.sep}${subDir}${cpath.sep}`);

    for (let i = 0; i < testList.length; ++i) {
        let testDef = testList[i];
        let testDir = rootPath.append(testDef.path);

        for (let j = 0; j < testDef.hlCount.length; ++j) {
            let test = new testClass(
                nodePath,
                testDir,
                testDef.sinterval,
                testDef.hlCount[j]);

            if (testDef.warn) {
                test.skip(testDef.warn);
            }

            taskList.push(test);
        }

        logModules(testDir);
    }
}

function ReportResults() {
    console.log('');
    console.log('++++++++++++');

    console.log(chalk.bold.green(`Passed: ${passing}`));

    if (skipped > 0) {
        console.log(chalk.bold.yellow(`Skipped: ${skipped}`));
    }

    if (failing > 0) {
        console.log(chalk.bold.red(`Failed: ${failing}`));
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

function ProcessSingleResult(task) {
    if (task.getState() === BaseTest.State.done) {
        if (task.getResult() === BaseTest.Result.pass) {
            passing++;
            console.log(chalk.green('Passed'));
        } else if (task.getResult() === BaseTest.Result.skip) {
            skipped++;
            console.log(task.getLog());
            console.log(chalk.bold.yellow('Skipped'));
        } else {
            failing++;
            console.log(task.getLog());
            console.log(chalk.bold.red('Failed'));
        }

        currentTask++;
    }

    setImmediate(ProcessWork);
}

function ProcessWork() {
    if (currentTask === taskList.length) {
        ReportResults();
    } else {
        let cTask = taskList[currentTask];

        if (cTask.getResult() === BaseTest.Result.skip) {
            console.log(`Running test: "${cTask.getFullName()}"`);
            ProcessSingleResult(cTask);
        } else {
            if (cTask.getState() === BaseTest.State.none) {
                console.log(`Running test: "${cTask.getFullName()}"`);
                BaseTest.clearRecordDir();

                cTask.runRecord(ProcessSingleResult);
            } else {
                assert(cTask.getState() === BaseTest.State.record);

                cTask.runReplay(ProcessSingleResult);
            }
        }
    }
}

////////

LoadTests('standAlone', standAloneTests, StandAloneTest);
LoadTests('http', httpTests, HttpTest);

ProcessWork();
