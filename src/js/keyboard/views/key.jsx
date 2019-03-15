import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {keyStateShape} from "../propdefs";


class Key extends Component {

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

    constructor (props) {
        super(props);
        this.element = React.createRef();
    }

    @autobind
    handleKeyDown (event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.element.current.addEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.down(this.props.number);
    }

    @autobind
    handleKeyUp () {
        this.element.current.removeEventListener("mouseout", this.handleKeyUp);
        this.props.handlers.up(this.props.number);
    }

    @autobind
    handleMouseEnter (event) {
        if (event.buttons & 0x1) {
            this.handleKeyDown();
        }
    }

    render () {
        const {
            name,
            inChordShiftChords = [],
            state,
            wrap,
            chordShiftActiveKey,
            chordShiftChordCount,
            lowChordIndex,
            highChordIndex,
            chordRatio
        } = this.props;

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
                ref={this.element}
            >
                {inChordShiftChords && inChordShiftChords.map(
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
                )}
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


export default Key;