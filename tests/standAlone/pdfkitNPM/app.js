var path = require('path');

process.on('exit', function () {
    let logdir = path.normalize(__dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + '_logDir' + path.sep);
    emitTTDLog(logdir);
});

var fs = require('fs');
var PDFDocument = require('pdfkit');

let pdffile = __dirname + path.sep + 'outfile.pdf'
let doc = undefined;

function addFontAndPageTest(cb) {
    telemetryLog('Adding font and page 1', true);

    doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdffile));

    //# Embed a font, set the font size, and render some text
    doc.font('Times-Roman')
        .fontSize(25)
        .text('Some text with an embedded font!', 100, 100);

    //# Add another page
    doc.addPage()
        .fontSize(25)
        .text('Here is some vector graphics...', 100, 100);

    cb();
}

function drawTriangleTest(cb) {
    telemetryLog('Draw triangle test', true);

    //# Draw a triangle
    doc.save()
        .moveTo(100, 150)
        .lineTo(100, 250)
        .lineTo(200, 250)
        .fill("#FF3300");

    cb();
}

function drawSVGTest(cb) {
    telemetryLog('Draw SVG test', true);

    //# Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6)
        .translate(470, -380)
        .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
        .fill('red', 'even-odd')
        .restore();

    cb();
}

function addLinkTest(cb) {
    telemetryLog('Link test', true);

    //# Add some text with annotations
    doc.addPage()
        .fillColor("blue")
        .text('Here is a link!', 100, 100)
        .underline(100, 100, 160, 27, { color: "#0000FF" })
        .link(100, 100, 160, 27, 'http://google.com/');

    cb();
}

function finalizeTest(cb) {
    telemetryLog('Finalize test', true);
    
    //Finalize PDF file
    doc.end();

    cb();
}

////////

var wlPos = 0;
var worklist = [addFontAndPageTest, drawTriangleTest, drawSVGTest, addLinkTest, finalizeTest];

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
