import React, {Component} from "react"; import PropTypes from "prop-types";
import {connect} from "react-redux";

import {
    KEYBOARD_PITCH_SHIFT,
    KEYBOARD_CHORD_SHIFT,
    KEYBOARD_CHORD_SHIFT_TOGGLE,
    KEYBOARD_KEY_DOWN,
    KEYBOARD_KEY_UP
} from "../../actions";
import {playStateShape} from "../../propdefs";

import ChordShift from "../chord-shift/chord-shift.jsx";
import RangeInput from "../RangeInput.jsx";

import Keys from "./keys.jsx";


class KeyboardView extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.shape({
            "handleChordShift": PropTypes.func.isRequired,
            "handlePitchShift": PropTypes.func.isRequired
        }).isRequired,
        "keyHandlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "playState": playStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.playState !== nextProps.playState);
    }

    render () {
        const {handlers, keyHandlers, playState, configuration} = this.props;
        const {handlePitchShift} = handlers;
        const {startKey, endKey} = configuration;

        return (
            <section className="controller keyboard">
                <Keys
                    chordShift={playState.chordShift}
                    endKey={endKey}
                    keyHandlers={keyHandlers}
                    keys={playState.keys}
                    startKey={startKey}
                />
                <ChordShift chordShift={playState.chordShift} />
                <div className="sliders">
                    <RangeInput
                        changeHandler={handlePitchShift}
                        className="pitch-shift"
                        configuration={{max: 1, min: -1, step: 0.01}}
                        label="Pitch shift"
                        value={playState.pitchShift}
                    />
                </div>
            </section>
        );
    }
}


const mapState = (state) => ({
    "configuration": state.settings.keyboard,
    "playState": state.playState
});
const mapDispatch = (dispatch) => ({
    "handlers": {
        "handlePitchShift": (value) => {dispatch({"type": KEYBOARD_PITCH_SHIFT, value});},
        "handleChordShift": (value) => {dispatch({"type": KEYBOARD_CHORD_SHIFT, value});},
        "handleChordShiftToggle": () => {dispatch({"type": KEYBOARD_CHORD_SHIFT_TOGGLE});}
    },
    "keyHandlers": {
        "down": (keyNumber) => {dispatch({"type": KEYBOARD_KEY_DOWN, keyNumber});},
        "up": (keyNumber) => {dispatch({"type": KEYBOARD_KEY_UP, keyNumber});}
    }
});
const KeyboardViewConnected = connect(mapState, mapDispatch)(KeyboardView);


export {
    KeyboardView
};

export default KeyboardViewConnected;
