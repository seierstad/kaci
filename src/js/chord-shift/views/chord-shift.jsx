import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import RangeInput from "../../static-source/views/range-input.jsx";
import * as KEYBOARD from "../../keyboard/actions";

import {
    chordShiftPlayStateShape,
    chordShiftPatchShape
} from "../propdefs";
import * as CHORD_SHIFT from "../actions";

import Chords from "./chords.jsx";
import Mode from "./chord-shift-mode-view.jsx";


class ChordShiftView extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "handleChordShift": PropTypes.func.isRequired,
            "handleChordShiftToggle": PropTypes.func.isRequired,
            "modeChangeHandler": PropTypes.func.isRequired
        }).isRequired,
        "keyHandlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": chordShiftPatchShape,
        "playState": chordShiftPlayStateShape.isRequired
    }

    render () {
        const {
            playState: {
                activeKeys = {},
                chords = [],
                enabled = false,
                amount = 0
            } = {},
            patch = {},
            handlers: {
                handleChordShift,
                handleChordShiftToggle,
                modeChangeHandler
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
                    value={amount}
                />
                <input
                    checked={enabled}
                    id="chord-shift-enabled"
                    onChange={handleChordShiftToggle}
                    type="checkbox"
                />
                <Mode changeHandler={modeChangeHandler} patch={patch} />
                <Chords activeKeys={activeKeys} chords={chords} keyHandlers={keyHandlers} />
            </section>
        );
    }
}

const mapDispatch = (dispatch) => ({
    "handlers": {
        "handleChordShift": (value) => dispatch({"type": KEYBOARD.CHORD_SHIFT, value}),
        "handleChordShiftToggle": () => dispatch({"type": KEYBOARD.CHORD_SHIFT_TOGGLE}),
        "modeChangeHandler": (mode) => dispatch({"type": CHORD_SHIFT.MODE_CHANGE, mode})
    },
    "keyHandlers": {
        "down": (chordIndex, keyNumber) => {dispatch({"type": CHORD_SHIFT.KEY_DOWN, chordIndex, keyNumber});},
        "up": (chordIndex, keyNumber) => {dispatch({"type": CHORD_SHIFT.KEY_UP, chordIndex, keyNumber});}
    }
});

const mapState = (state) => ({
    "patch": state.patch.chordShift
});

const ChordShiftViewConnected = connect(mapState, mapDispatch)(ChordShiftView);


export default ChordShiftViewConnected;
