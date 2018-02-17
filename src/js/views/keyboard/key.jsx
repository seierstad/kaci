import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import autobind from "autobind-decorator";

import {keyStateShape} from "../../propdefs";
import * as Actions from "../../actions";


class KeyPresentation extends Component {

    static propTypes = {
        "chordRatio": PropTypes.number,
        "chordShiftActiveKey": PropTypes.bool,
        "chordShiftChordCount": PropTypes.number,
        "handlers": PropTypes.shape({
            "down": PropTypes.func.isRequired,
            "up": PropTypes.func.isRequired
        }),
        "highChordIndex": PropTypes.number,
        "inChordShiftChords": PropTypes.arrayOf(PropTypes.number),
        "lowChordIndex": PropTypes.number,
        "name": PropTypes.string.isRequired,
        "number": PropTypes.number.isRequired,
        "state": keyStateShape,
        "wrap": PropTypes.bool
    }

    @autobind
    handleKeyDown (event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.element.addEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.down(this.props.number);
    }

    @autobind
    handleKeyUp () {
        this.element.removeEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.up(this.props.number);
    }

    @autobind
    handleMouseEnter (event) {
        if (event.buttons & 0x1) {
            this.handleKeyDown();
        }
    }

    render () {
        const {name, inChordShiftChords, state, wrap, chordShiftActiveKey, chordShiftChordCount, lowChordIndex, highChordIndex, chordRatio} = this.props;
        const classNames = ["key", name];
        if (state && state.down) {
            classNames.push("down");
        }

        const button = (
            <button
                className={classNames.join(" ")}
                onMouseDown={this.handleKeyDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseUp={this.handleKeyUp}
                ref={k => this.element = k}
            >
                {inChordShiftChords ?
                    inChordShiftChords.map(
                        chordIndex => {
                            const grow = chordIndex === lowChordIndex ? chordRatio : chordIndex === highChordIndex ? 100 - chordRatio : null;
                            return (
                                <div
                                    className={"in-chord chord-" + chordIndex}
                                    key={chordIndex}
                                    style={grow ? {flexBasis: grow} : null}
                                />
                            );
                        }
                    )
                    : null
                }
                {chordShiftActiveKey ? <div className={"active-key chord-" + chordShiftChordCount} /> : null}
            </button>
        );

        if (wrap) {
            return (
                <div className={"key-wrapper " + name}>
                    {button}
                </div>
            );
        }

        return button;
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
