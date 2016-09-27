var React = require('react');
var ReactDOMServer = require('react-dom/server');

//create an element that hangs around for snapshots and such
 var gelem = React.DOM.div(null, 
        React.DOM.h1(null, 'Hello world!'),
        React.DOM.p(null, 'This DOM is in the global state.')
    );

function basicTest(cb) {
    telemetryLog('Basic test', true);

    var relem = React.DOM.div(null, 'Hello World!');
    var reactHtml = ReactDOMServer.renderToString(relem);
    telemetryLog(reactHtml, true);

    cb();
}

function childrenTest(cb) {
    telemetryLog('Children test', true);

    var relem = React.DOM.div(null, 
        React.DOM.h1(null, 'Hello world!'),
        React.DOM.p(null, 'This DOM was rendered from JS.')
    );
    
    var reactHtml = ReactDOMServer.renderToString(relem);
    telemetryLog(reactHtml, true);

    cb();
}

function complexTest(cb) {
    telemetryLog('Complex test', true);

    var toggled = false;
    var relem = React.DOM.div(
      null,
      React.DOM.h1(null, 'Hello world!'),
      React.DOM.form(
        null,
        'Your name is ',
        React.DOM.input({
          type: 'text',
          placeholder: 'Your name here'
        })
      ),
      React.DOM.p(null, 'The time is ' + new Date('December 17, 1995 03:24:00')),
      React.DOM.h1({
        className: toggled ? 'red' : 'blue'
      }, 'Hello, world!'),
      React.DOM.button({
        onClick: function() {
          toggled = !toggled;
          render();
        }
      }, 'Toggle color')
    );

    var reactHtml = ReactDOMServer.renderToString(relem);
    telemetryLog(reactHtml, true);

    cb();
}

function globalTest(cb) {
    telemetryLog('Global test', true);

    var reactHtml = ReactDOMServer.renderToString(gelem);
    telemetryLog(reactHtml, true);

    cb();
}

////////

var wlPos = 0;
var worklist = [basicTest, childrenTest, complexTest, globalTest];

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