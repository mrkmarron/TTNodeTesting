var React = require('react');

module.exports = class Counter extends React.Component {
    constructor() {
        super();
        this.state = {
            count: 3
        };
    }

    incrementCount() {
        this.setState({ count: this.state.count + 1 });
    }

    render() {
        return (
            React.DOM.button({
                onClick: function () {
                    this.incrementCount.bind(this)
                },
                Count: this.state.count,
                className: 'countButton'
            }, 
            '#' + this.state.count.toString()
            )
        );
    }
}

