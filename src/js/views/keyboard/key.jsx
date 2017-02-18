import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {keyStateShape} from "../../propdefs";
import * as Actions from "../../actions";

class KeyPresentation extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "down": PropTypes.func.isRequired,
            "up": PropTypes.func.isRequired
        }),
        "height": PropTypes.number.isRequired,
        "name": PropTypes.string.isRequired,
        "number": PropTypes.number.isRequired,
        "playState": keyStateShape.isRequired,
        "width": PropTypes.number.isRequired,
        "x": PropTypes.number.isRequired
    }

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
        const classNames = ["key", name];
        if (playState && playState.down) {
            classNames.push("down");
        }
        return (
            <rect
                className={classNames.join(" ")}
                height={height + "%"}
                onMouseDown={this.handleKeyDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseUp={this.handleKeyUp}
                ref={k => this.element = k}
                width={width + "%"}
                x={x + "%"}
                y="0"
            />
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "down": (keyNumber) => {dispatch({"type": Actions.KEYBOARD_KEY_DOWN, keyNumber});},
        "up": (keyNumber) => {dispatch({"type": Actions.KEYBOARD_KEY_UP, keyNumber});}
    }
});

const Key = connect(null, mapDispatch)(KeyPresentation);


export default Key;
