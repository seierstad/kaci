import {Component, PropTypes} from "react";


class Key extends Component {
    constructor () {
        super();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    handleKeyDown (event) {
        const {handlers, keyNumber} = this.props;
        handlers.down(event, keyNumber);
    }

    handleKeyUp (event) {
        const {handlers, keyNumber} = this.props;
        handlers.up(event, keyNumber);
    }

}
Key.propTypes = PropTypes.shape({
    "handlers": PropTypes.object.isRequired,
    "keyNumber": PropTypes.number.isRequired
});


export default Key;
