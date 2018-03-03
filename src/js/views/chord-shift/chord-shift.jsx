import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {chordShiftShape} from "../../propdefs";
import {
    KEYBOARD_CHORD_SHIFT,
    KEYBOARD_CHORD_SHIFT_TOGGLE,
    CHORD_SHIFT
} from "../../actions";

import RangeInput from "../RangeInput.jsx";

import Chords from "./chords.jsx";


class ChordShiftView extends Component {

    static propTypes = {
        "chordShift": chordShiftShape.isRequired
    }

    render () {
        const {
            chordShift: {
                activeKeys = {},
                chords = [],
                enabled = false,
                value = 0
            } = {},
            handlers: {
                handleChordShift,
                handleChordShiftToggle
            },
            keyHandlers
        } = this.props;

        return (
            <section className="chord-shift">
                <RangeInput
                    changeHandler={handleChordShift}
                    className="chord-shift"
                    configuration={{max: 1, min: 0, step: 0.01}}
                    label="Chord shift"
                    value={value}
                />
                <input
                    checked={enabled}
                    id="chord-shift-enabled"
                    onChange={handleChordShiftToggle}
                    type="checkbox"
                />
                <Chords activeKeys={activeKeys} chords={chords} keyHandlers={keyHandlers} />
            </section>
        );
    }
}

const mapDispatch = (dispatch) => ({
    "handlers": {
        "handleChordShift": (value) => {dispatch({"type": KEYBOARD_CHORD_SHIFT, value});},
        "handleChordShiftToggle": () => {dispatch({"type": KEYBOARD_CHORD_SHIFT_TOGGLE});}
    },
    "keyHandlers": {
        "down": (chordIndex, keyNumber) => {dispatch({"type": CHORD_SHIFT.KEY_DOWN, chordIndex, keyNumber});},
        "up": (chordIndex, keyNumber) => {dispatch({"type": CHORD_SHIFT.KEY_UP, chordIndex, keyNumber});}
    }
});

const ChordShiftViewConnected = connect(null, mapDispatch)(ChordShiftView);


export default ChordShiftViewConnected;
