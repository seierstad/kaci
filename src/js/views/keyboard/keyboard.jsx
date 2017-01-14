import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {NOTE_NAMES} from "../../constants";
import {KEYBOARD_PITCH_SHIFT, KEYBOARD_CHORD_SHIFT} from "../../actions";
import {playStateShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";
import Key from "./key.jsx";


class KeyboardViewPresentation extends Component {
    componentWillMount () {
        const {configuration: {startKey, endKey}} = this.props;
        this.keyWidth = 100 / ((endKey - startKey) - (((endKey - startKey) / 12) * 5));
    }

    render () {
        const {handlers, playState, configuration} = this.props;
        const {handlePitchShift, handleChordShift} = handlers;
        const {startKey, endKey} = configuration;

        const whiteKeys = [];
        const blackKeys = [];


        let nextKeyX = 0;

        for (let i = startKey; i < endKey; i += 1) {
            const k = i % 12;
            const black = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
            const noteName = NOTE_NAMES[i % 12];

            const key = (
                <Key
                    height={black ? "60%" : "100%"}
                    key={i + "-" + noteName}
                    name={noteName}
                    number={i}
                    playState={playState.keys[i]}
                    width={black ? (this.keyWidth * 0.7) : this.keyWidth}
                    x={(black ? (nextKeyX - this.keyWidth * 0.35) : nextKeyX) + "%"}
                />
            );

            if (!black) {
                nextKeyX += this.keyWidth;
            }

            if (black) {
                blackKeys.push(key);
            } else {
                whiteKeys.push(key);
            }

        }


        return (
            <section className="controller keyboard" id="keyboard-view">
                <svg className="keys" height="180px" width="100%">
                    <g className="white">
                        {whiteKeys}
                    </g>
                    <g className="black">
                        {blackKeys}
                    </g>
                </svg>
                <div className="sliders">
                    <RangeInput
                        changeHandler={handlePitchShift}
                        className="pitch-shift"
                        label="Pitch shift"
                        max={1}
                        min={-1}
                        step={0.01}
                        value={playState.pitchShift}
                    />
                    <RangeInput
                        changeHandler={handleChordShift}
                        className="chord-shift"
                        label="Chord shift"
                        max={1}
                        min={0}
                        step={0.01}
                        value={playState.chordShift}
                    />
                </div>
            </section>
        );
    }
}
KeyboardViewPresentation.propTypes = {
    "configuration": PropTypes.object.isRequired,
    "handlers": PropTypes.shape({
        "handleChordShift": PropTypes.func.isRequired,
        "handlePitchShift": PropTypes.func.isRequired
    }).isRequired,
    "playState": playStateShape.isRequired
};

const mapState = (state) => ({
    "configuration": state.settings.keyboard,
    "playState": state.playState
});
const mapDispatch = (dispatch) => ({
    "handlers": {
        "handlePitchShift": (value) => {dispatch({"type": KEYBOARD_PITCH_SHIFT, value});},
        "handleChordShift": (value) => {dispatch({"type": KEYBOARD_CHORD_SHIFT, value});}
    }
});
const KeyboardView = connect(mapState, mapDispatch)(KeyboardViewPresentation);


export default KeyboardView;

/*

    var setKeyStyling = function (key, amount) {
        key.style.fill = "rgba(0,0,255," + amount + ")";
    };
    var chordShiftChangedHandler = function (event) {
        var i,
            j,
            pair,
            balance = event.detail.balance;

        for (i = 0, j = event.detail.keys.length; i < j; i += 1) {
            pair = event.detail.keys[i];
            if (keys[pair.from]) {
                setKeyStyling(keys[pair.from].DOMElement, 1 - balance);
            }
            if (keys[pair.to]) {
                setKeyStyling(keys[pair.to].DOMElement, balance);
            }
        }
    };

    var chordShiftEnabledHandler = function (event) {
        console.log("TODO: handle enabled chordShift in keyboardView");
    };

    var chordShiftDisabledHandler = function (event) {
        function removeChordShiftStyling(key) {
            key.DOMElement.style.fill = null;
        }
        keys.forEach(removeChordShiftStyling);
    }

*/
