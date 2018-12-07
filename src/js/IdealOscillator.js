import autobind from "autobind-decorator";
import {waveforms} from "./waveforms";
import Oscillator from "./decorators/oscillator";


class IdealOscillator extends Oscillator {

    constructor (...args) {
        super(...args);

        this.sampleAndHoldBuffer = {
            value: null,
            phase: 0
        };
    }

    set waveform (waveformName) {
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    @autobind
    audioProcessHandler (event) {
        const frequency = event.inputBuffer.getChannelData(0);
        const detune = event.inputBuffer.getChannelData(1);
        const output = event.outputBuffer.getChannelData(0);

        output.forEach((v, i, out) => {
            out[i] = this.generatorFunction(frequency[i], detune[i]);
        });
    }

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

        return this.selectedWaveform(this.phase);
    }

    resetPhase () {
        this.phase = 0;
        this.sampleAndHoldBuffer.phase = 0;
        this.zeroPhaseActions();
    }
}


export default IdealOscillator;
