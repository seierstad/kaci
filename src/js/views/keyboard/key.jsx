import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import * as Actions from "../../Actions.jsx";

class KeyPresentation extends Component {
    constructor () {
        super();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.playState !== this.props.playState;
    }

    handleKeyDown (event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.element.addEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.down(this.props.number);
    }

    handleKeyUp () {
        this.element.removeEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.up(this.props.number);
    }

    handleMouseEnter (event) {
        if (event.buttons & 0x1) {
            this.handleKeyDown();
        }
    }

    render () {
        const {x, width, height, name, playState} = this.props;
        return (
            <rect
                className={"key " + name + (playState && playState.down ? " down" : "")}
                height={height}
                onMouseDown={this.handleKeyDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseUp={this.handleKeyUp}
                ref={k => this.element = k}
                width={width + "%"}
                x={x}
                y="0"
            />
        );
    }
}
KeyPresentation.propTypes = {
    "handlers": PropTypes.shape({
        "down": PropTypes.func.isRequired,
        "up": PropTypes.func.isRequired
    }),
    "number": PropTypes.number.isRequired
};

const mapDispatch = (dispatch) => ({
    "handlers": {
        "down": (keyNumber) => {dispatch({"type": Actions.KEYBOARD_KEY_DOWN, keyNumber});},
        "up": (keyNumber) => {dispatch({"type": Actions.KEYBOARD_KEY_UP, keyNumber});}
    }
});

const Key = connect(null, mapDispatch)(KeyPresentation);

export default Key;
