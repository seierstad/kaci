import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {NOTE_NAMES} from "../../constants";
import {KEYBOARD_PITCH_SHIFT, KEYBOARD_CHORD_SHIFT, KEYBOARD_CHORD_SHIFT_TOGGLE} from "../../actions";
import {playStateShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";
import Keys from "./keys.jsx";


class KeyboardViewPresentation extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.shape({
            "handleChordShift": PropTypes.func.isRequired,
            "handlePitchShift": PropTypes.func.isRequired
        }).isRequired,
        "playState": playStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.playState !== nextProps.playState);
    }

    render () {
        const {handlers, playState, configuration} = this.props;
        const {handlePitchShift, handleChordShift, handleChordShiftToggle} = handlers;
        const {startKey, endKey} = configuration;

        return (
            <section className="controller keyboard">
                <Keys
                    chordShift={playState.chordShift}
                    endKey={endKey}
                    keys={playState.keys}
                    startKey={startKey}
                />
                <div className="sliders">
                    <RangeInput
                        changeHandler={handlePitchShift}
                        className="pitch-shift"
                        configuration={{max: 1, min: -1, step: 0.01}}
                        label="Pitch shift"
                        value={playState.pitchShift}
                    />
                    <RangeInput
                        changeHandler={handleChordShift}
                        className="chord-shift"
                        configuration={{max: 1, min: 0, step: 0.01}}
                        label="Chord shift"
                        value={playState.chordShift.value}
                    />
                    <input
                        checked={playState.chordShift.enabled}
                        id="chord-shift-enabled"
                        onChange={handleChordShiftToggle}
                        type="checkbox"
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
        "handleChordShiftToggle": (event) => {dispatch({"type": KEYBOARD_CHORD_SHIFT_TOGGLE});}
    }
});
const KeyboardView = connect(mapState, mapDispatch)(KeyboardViewPresentation);


export default KeyboardView;
