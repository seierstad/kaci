import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import RangeInput from "../../static-source/views/range-input.jsx";
import {playStateShape} from "../../play-state/propdefs";
import * as KEYBOARD from "../actions";


import Keys from "./keys.jsx";

import "./keyboard.scss";

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
        "handlePitchShift": (value) => {dispatch({"type": KEYBOARD.PITCH_SHIFT, value});},
        "handleChordShift": (value) => {dispatch({"type": KEYBOARD.CHORD_SHIFT, value});},
        "handleChordShiftToggle": () => {dispatch({"type": KEYBOARD.CHORD_SHIFT_TOGGLE});}
    },
    "keyHandlers": {
        "down": (keyNumber) => {dispatch({"type": KEYBOARD.KEY_DOWN, keyNumber});},
        "up": (keyNumber) => {dispatch({"type": KEYBOARD.KEY_UP, keyNumber});}
    }
});
const KeyboardViewConnected = connect(mapState, mapDispatch)(KeyboardView);


export {
    KeyboardView
};

export default KeyboardViewConnected;
