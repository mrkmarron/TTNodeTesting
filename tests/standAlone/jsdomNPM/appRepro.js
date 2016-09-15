let jsdom = require('jsdom');

let htmlf1 = `${__dirname}\\test1.html`;

jsdom.env(
    htmlf1,
    [],
    function (err, window) {
        console.log(`Error is ${err}`);
        console.log(`Uri is ${window.document.documentURI}`);
    }
);
