var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

let cheerio = require('cheerio');

//let doc persist between tests for extra coverage
let sample = undefined;

//markup to use in tests
let markup = 
"<ul id='fruits'> \
  <li class='apple'>Apple</li> \
  <li class='orange'>Orange</li> \
  <li class='pear'>Pear</li> \
</ul>";

function basicTest(cb) {
    telemetryLog('Basic test', true);

    sampleDoc = cheerio.load('<h2 class="title">Hello world</h2>');
    sampleDoc('h2.title').text('Hello there!');
    sampleDoc('h2').addClass('welcome');
 
    telemetryLog(`${sampleDoc.html()}`, true); // <h2 class="title welcome">Hello there!</h2> 

    cb();
}

function selectorTest(cb) {
    telemetryLog('Selector test', true);

    let doc = cheerio.load(markup);

    telemetryLog(`${doc('.apple', '#fruits').text()}`, true); // Apple 
    telemetryLog(`${doc('ul .pear').attr('class')}`, true); // pear 
    telemetryLog(`${doc('li[class=orange]').html()}`, true); // Orange 

    cb();
}

function attributeTest(cb) {
    telemetryLog('Attributes test', true);

    let doc = cheerio.load(markup);

    telemetryLog(`${doc('ul').attr('id')}`, true); // fruits 

    doc('.apple').attr('id', 'favorite');
    telemetryLog(`${doc('.apple').attr('id')}`, true); // favorite 

    cb();
}

function dataTest(cb) {
    telemetryLog('Data test', true);

    let doc = cheerio.load(markup);

    telemetryLog(`${JSON.stringify(doc('<div data-apple-color="red"></div>').data())}`, true); // { appleColor: 'red' } 
    telemetryLog(`${doc('<div data-apple-color="red"></div>').data('apple-color')}`, true); // red 

    cb();
}

function removeClassTest(cb) {
    telemetryLog('Remove test', true);

    let doc = cheerio.load(markup);

    doc('.pear').removeClass('pear');
    doc('.apple').addClass('red').removeClass();

    telemetryLog(`${doc.html()}`, true); // ... <li class="">Apple</li> ... <li class="">Pear</li>   

    cb();
}

function traversingTest(cb) {
    telemetryLog('Traversing test', true);

    let doc = cheerio.load(markup);

    telemetryLog(`${doc('#fruits').find('li').length}`, true); // 3 
    telemetryLog(`${doc('#fruits').find(doc('.apple')).length}`, true); // 1 

    cb();
}

function childrenTest(cb) {
    telemetryLog('Children test', true);

    let doc = cheerio.load(markup);

    telemetryLog(`${doc('#fruits').children().length}`, true); // 3 
    telemetryLog(`${doc('#fruits').children('.pear').text()}`, true); // Pear 

    cb();
}

function appendTest(cb) {
    telemetryLog('Append test', true);

    let doc = cheerio.load(markup);
    doc('ul').append('<li class="plum">Plum</li>');

    telemetryLog(`${doc('#fruits').children().length}`, true); // 4

    cb();
}

function removeTest(cb) {
    telemetryLog('Children test', true);

    let doc = cheerio.load(markup);
    doc('.pear').remove()

    telemetryLog(`${doc('#fruits').children().length}`, true); // 2

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTest, selectorTest, attributeTest, dataTest, removeClassTest, traversingTest, childrenTest, appendTest, removeTest];

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