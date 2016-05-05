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
    			className={"key " + noteName + (playState && playState.pressed ? " pressed" : "")}
    			y="0"
                x={x}
                width={keyWidth + "%"}
                height="100%"
                onMouseDown={this.keyDownHandler}
                onMouseUp={this.keyUpHandler}
                />
        );
	}
}
class BlackKey extends Key {
	render () {
		const {x, keyWidth, noteName, keyNumber, playState} = this.props;
		return (
    		<rect
				className={"key " + noteName + (playState && playState.pressed ? " pressed" : "")}
				y="0"
                x={x}
                width={(keyWidth * 0.7) + "%"}
                height="60%"
                onMouseDown={this.keyDownHandler}
                onMouseUp={this.keyUpHandler}
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
            			playState={playState.keys[i]}
            			key={i + "-" + noteName}
            			noteName={noteName}
            			keyNumber={i}
	                    x={(nextKeyX - keyWidth * 0.35) + "%"}
	                    keyWidth={keyWidth}
	                    handlers={handlers.key}
	                    />
            	);
            } else {
            	whiteKeys.push(
            		<WhiteKey
            			playState={playState.keys[i]}
            			key={i + "-" + noteName}
            			noteName={noteName}
            			keyNumber={i}
	                    x={nextKeyX + "%"}
	                    keyWidth={keyWidth}
	                    handlers={handlers.key}
	                    />
	            );
                nextKeyX += keyWidth;
            }
        }


		return (
			<section id="keyboard-view" className="controller keyboard">
				<svg width="100%" height="180px">
					<g className="white">
						{whiteKeys}
					</g>
					<g className="black">
						{blackKeys}
					</g>
				</svg>
				<RangeInput 
	                label="Pitch shift"
	                min={-1}
	                max={1}
	                step={0.01}
	                changeHandler={handlers.pitchShift}
	                value={playState.pitchShift}
	                />
	            <RangeInput 
	                label="Chord shift"
	                min={0}
	                max={1}
	                step={0.01}
	                changeHandler={handlers.chordShift}
	                value={playState.chordShift}
	                />
			</section>
		);
	}
}

export default KeyboardView;
/*
    keyDownHandler = function (event) {


        case 'touchstart':

    keyUpHandler = function keyUp(event) {
        var keyReleased,
            number;

        switch (event.type) {
        case 'mouseup':
        case 'mouseout':
            keys.forEach(isReleased);
            break;
        }
    };

    var voiceStartedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('dropped');
                key.DOMElement.classList.add('pressed');
            }
        });
    };
    var voiceEndedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
            }
        });
    };
    var voiceDroppedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
                key.DOMElement.classList.add('dropped');
            }
        });
    };

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
    init();

    keyboard.addEventListener('mousedown', keyDownHandler, false);
    keyboard.addEventListener('mouseup', keyUpHandler, false);
    keyboard.addEventListener('mouseout', keyUpHandler, false);
    document.addEventListener('touchstart', keyDownHandler, false);
    context.addEventListener('voice.started', voiceStartedHandler); // new voice started
    context.addEventListener('voice.ended', voiceEndedHandler); // voice finished
    context.addEventListener("chordShift.changed", chordShiftChangedHandler, false);
    context.addEventListener("chordShift.enabled", chordShiftEnabledHandler, false);
    context.addEventListener("chordShift.disabled", chordShiftDisabledHandler, false);
    context.addEventListener("pitchBend.change", pitchBendHandler, false);

    return view;
};

module.exports = KeyboardView;
*/