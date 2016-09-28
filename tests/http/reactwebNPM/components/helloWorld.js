var React = require('react');
var Counter = require('./counter');

module.exports = class HelloWorld extends React.Component {
    render() {
        return (
            React.DOM.div(null,
                React.DOM.p(null, 'Hello world!'),
                React.createElement(Counter)
            )
        );
    }
} 
