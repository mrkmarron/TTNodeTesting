const builder = require('xmlbuilder');

const BaseTest = require('./base-test');

function junitReport(testResults) {
    const xml = builder.create('testsuite', { headless: false });
    xml.att('name', 'ttdtests');

    testResults.forEach((testResult) => {
        addResult(xml, testResult);
    });

    xml.end({ pretty: true });

    return xml;
}

function addResult(xml, testResult) {
    const item = xml.ele('testcase');
    item.att('name', testResult.getFullName());
    item.ele('system-out').dat(testResult.getLog());

    const result = testResult.getResult();
    if (result === BaseTest.Result.skip) {
        item.ele('skipped');
    } else if (result === BaseTest.Result.fail) {
        item.ele('failure', { 'message': 'module test suite failed' });
    }
}

module.exports = junitReport;