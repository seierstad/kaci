import ReactDOM from "react-dom";
import React, {Component} from "react";

import {NOTE_NAMES} from "../constants";

import RangeInput from "./RangeInput.jsx";


class Key extends Component {
    constructor () {
        super();
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
    }

    keyDownHandler (event) {
        const {handlers, keyNumber} = this.props;
        handlers.down(event, keyNumber);
    }

    keyUpHandler (event) {
        const {handlers, keyNumber} = this.props;
        handlers.up(event, keyNumber);
    }

}

class WhiteKey extends Key {
    render () {
        const {x, keyWidth, noteName, keyNumber, playState} = this.props;
        return (
            <rect
                className={"key " + noteName + (playState && playState.down ? " down" : "")}
                height="100%"
                onMouseDown={this.keyDownHandler}
                onMouseUp={this.keyUpHandler}
                width={keyWidth + "%"}
                x={x}
                y="0"
            />
        );
    }
}

class BlackKey extends Key {
    render () {
        const {x, keyWidth, noteName, keyNumber, playState} = this.props;
        return (
            <rect
                className={"key " + noteName + (playState && playState.down ? " down" : "")}
                height="60%"
                onMouseDown={this.keyDownHandler}
                onMouseUp={this.keyUpHandler}
                width={(keyWidth * 0.7) + "%"}
                x={x}
                y="0"
            />
        );
    }
}


class KeyboardView extends Component {
    render () {
        const {handlers, playState, configuration} = this.props;
        const {startKey, endKey} = configuration;
        const keyWidth = 100 / ((endKey - startKey) - (((endKey - startKey) / 12) * 5));

        const whiteKeys = [];
        const blackKeys = [];


        let nextKeyX = 0;

        for (let i = startKey; i < endKey; i += 1) {
            const k = i % 12;
            const black = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
            const noteName = NOTE_NAMES[i % 12];

            if (black) {
                blackKeys.push(
                    <BlackKey
                        handlers={handlers.key}
                        key={i + "-" + noteName}
                        keyNumber={i}
                        keyWidth={keyWidth}
                        noteName={noteName}
                        playState={playState.keys[i]}
                        x={(nextKeyX - keyWidth * 0.35) + "%"}
                    />
                );
            } else {
                whiteKeys.push(
                    <WhiteKey
                        handlers={handlers.key}
                        key={i + "-" + noteName}
                        keyNumber={i}
                        keyWidth={keyWidth}
                        noteName={noteName}
                        playState={playState.keys[i]}
                        x={nextKeyX + "%"}
                    />
                );
                nextKeyX += keyWidth;
            }
        }


        return (
            <section className="controller keyboard" id="keyboard-view">
                <svg height="180px" width="100%">
                    <g className="white">
                        {whiteKeys}
                    </g>
                    <g className="black">
                        {blackKeys}
                    </g>
                </svg>
                <RangeInput
                    changeHandler={handlers.pitchShift}
                    label="Pitch shift"
                    max={1}
                    min={-1}
                    step={0.01}
                    value={playState.pitchShift}
                />
                <RangeInput
                    changeHandler={handlers.chordShift}
                    label="Chord shift"
                    max={1}
                    min={0}
                    step={0.01}
                    value={playState.chordShift}
                />
            </section>
        );
    }
}


export default KeyboardView;

/*

    var setKeyStyling = function (key, amount) {
        key.style.fill = "rgba(0,0,255," + amount + ")";
    };
    const chordShiftChangedHandler = function (event) {
        const balance = event.detail.balance;

        for (let i = 0, j = event.detail.keys.length; i < j; i += 1) {
            let pair = event.detail.keys[i];
            if (keys[pair.from]) {
                setKeyStyling(keys[pair.from].DOMElement, 1 - balance);
            }
            if (keys[pair.to]) {
                setKeyStyling(keys[pair.to].DOMElement, balance);
            }
        }
    };

    const chordShiftEnabledHandler = function () {
        console.log("TODO: handle enabled chordShift in keyboardView");
    };

    const chordShiftDisabledHandler = function () {
        function removeChordShiftStyling (key) {
            key.DOMElement.style.fill = null;
        }
        keys.forEach(removeChordShiftStyling);
    }

*/
