import WavyJones from "../../lib/wavy-jones";
import {BUFFER_LENGTH} from "./constants";
import Periodic from "./decorators/periodic";
import {inputNode, morseEncode} from "./shared-functions";
import Oscillator from "./decorators/oscillator";


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


class MorseGenerator extends Periodic {

    constructor (context, store, patch, dc, index, isSyncMaster) {
        super(context, store, patch, dc, index, isSyncMaster);

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new MorseOscillator(context, dc);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
        }

        this.parameters = {...this.oscillator.targets};
        this.text = patch.text;
    }

    set text (text) {
        this.oscillator.pattern = morseEncode(text);
    }

    stateChangeHandler () {

        const newState = this.store.getState().patch.morse[this.index];

        if (newState && (newState !== this.state)) {
            super.updateState(newState);

            if (this.state.text !== newState.text) {
                this.text = newState.text;
            }

            this.state = newState;
        }
    }

    destroy () {
        super.destroy();

        this.unsubscribe();

        this.stateChangeHandler = null;
        this.unsubscribe = null;
    }
}


export default MorseGenerator;
