//import WavyJones from "../../lib/wavy-jones";
import autobind from "autobind-decorator";

import {BUFFER_LENGTH} from "./constants";
import KaciNode from "./kaci-node";
import {inputNode, morseEncode, padPattern, shiftPattern, fillPatternToMultipleOf} from "./shared-functions";
import Oscillator from "./decorators/oscillator";
import Modulator from "./decorators/modulator";


class MorseOscillator extends Oscillator {

    generatorFunction (frequency, detune) {
        let calculatedFrequency;

        if (frequency === this.previous.frequency && detune === this.previous.detune) {
            calculatedFrequency = this.previous.calculatedFrequency;
        } else {
            calculatedFrequency = this.getComputedFrequency(frequency, detune);
            this.previous = {
                frequency,
                detune,
                calculatedFrequency
            };
        }
        this.incrementPhase(calculatedFrequency);

        const index = Math.floor(this.phase * this.pattern.length);

        return this.pattern[index] ? 1 : -1;
    }

    set pattern (pattern) {
        this.morsePattern = pattern;
    }

    get pattern () {
        return this.morsePattern;
    }
}


class MorseGenerator extends Modulator {

    constructor (...args) {
        super(...args);
        const [context, dc, store, patch, index] = args;

        this.stateSelector = ["patch", "morse", index];
        this.changeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.changeHandler);

        this.oscillator = new MorseOscillator(this.context, this.dc);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        this.parameters = {...this.oscillator.targets};


        this.pattern = patch;
        this.frequency = this.state.frequency;
    }

    set frequency (frequency) {
        this.oscillator.frequency = frequency * (this.state.speedUnit / this.oscillator.pattern.length);
    }

    set pattern ({text, speedUnit, shift, padding, fillToFit}) {
        let pattern = morseEncode(text);
        if (padding) {
            pattern = padPattern(pattern, padding);
        }
        if (fillToFit && speedUnit) {
            pattern = fillPatternToMultipleOf(pattern, speedUnit);
        }
        if (shift) {
            pattern = shiftPattern(pattern, shift);
        }

        if (pattern.length === 0) {
            pattern = [false];
        }
        this.oscillator.pattern = pattern;
    }

    updateState (newState) {
        const patternChanged = (
            this.state.text !== newState.text
            || this.state.speedUnit !== newState.speedUnit
            || this.state.shift !== newState.shift
            || this.state.padding !== newState.padding
            || this.state.fillToFit !== newState.fillToFit
        );

        if (patternChanged) {
            this.pattern = newState;
        }

        if (patternChanged || this.state.frequency !== newState.frequency) {
            this.frequency = newState.frequency;
        }

        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        this.state = newState;
    }

    destroy () {
        super.destroy();
        this.unsubscribe();

        this.stateChangeHandler = null;
        this.unsubscribe = null;
    }
}


export default MorseGenerator;
