import autobind from "autobind-decorator";
import KaciAudioNode from "../kaci-audio-node";
import {BUFFER_LENGTH} from "../constants";
import {
    mixValues,
    phaseDistortionFunction,
    inputNode,
    fractionsLeastCommonIntegerMultiple,
    flipFraction
} from "../shared-functions";
import {waveforms, wrappers} from "../waveform/waveforms";
import {OSCILLATOR_MODE} from "./constants";


class PDOscillator extends KaciAudioNode {
    static inputNames = [
        "frequency",
        "detune",
        "resonance",
        "pd_mix",
        "waveform",
        "wrapper",
        "harm_mix"
    ];

    constructor (...args) {
        super(...args);

        const [context, , patch] = args;
        this.state = patch;

        this.parameters = {...this.outputStage.parameters};
        this.mergedInput = context.createChannelMerger(this.constructor.inputNames.length);

        this.constructor.inputNames.forEach((inputName, index) => {
            this.parameters[inputName] = inputNode(context);

            //connect input to merge node
            this.parameters[inputName].connect(this.mergedInput, null, index);
        });

        this.phase = 0;
        this.resonancePhase = 0;
        this.previous = {
            frequency: 0,
            detune: 0,
            resonance: 0,
            calculatedFrequency: 0,
            calculatedResonanceFrequency: 0
        };

        this.generator = context.createScriptProcessor(BUFFER_LENGTH, this.constructor.inputNames.length, 1);

        this.pdFunctions = [];

        this.counter = 0;

        this.counterMax = fractionsLeastCommonIntegerMultiple(patch.harmonics[0].map(flipFraction));

        this.mergedInput.connect(this.generator);
        this.generator.connect(this.outputStage.input);

        this.pd = patch.pd;
        this.active = patch.active;
        this.waveform = patch.waveform;
        this.mode = patch.mode;
        this.wrapper = patch.wrapper;
        this.harmonics = patch.harmonics;
    }

    get targets () {
        return this.parameters;
    }

    set waveform (waveform) {
        const {name: waveformName} = waveform;
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    set wrapper (wrapper) {
        if (wrapper.name && typeof wrappers[wrapper.name] === "function") {
            this.selectedWrapper = wrappers[wrapper.name]();
        }
    }

    set mode (mode) {
        this.state.mode = mode;
    }

    get mode () {
        return this.state.mode;
    }

    set harmonics (harmonics) {
        this.counterMax = fractionsLeastCommonIntegerMultiple(harmonics[0].map(flipFraction));
        this.state.harmonics = harmonics;
    }

    set pd (pd) {
        this.pd0 = pd[0];
        this.pd1 = pd[1];
    }

    set pd0 (pd) {
        this.pdFunctions[0] = phaseDistortionFunction(pd.steps);
    }

    set pd1 (pd) {
        this.pdFunctions[1] = phaseDistortionFunction(pd.steps);
    }

    @autobind
    init () {
        return new Promise((resolve) => {
            resolve(this);
        });
    }

    start () {
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }

    stop () {
        this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
        this.phase = 0;
        this.resonancePhase = 0;
    }

    @autobind
    audioProcessHandler (event) {
        const frequency = event.inputBuffer.getChannelData(0);
        const detune = event.inputBuffer.getChannelData(1);
        const resonance = event.inputBuffer.getChannelData(2);
        const pdMix = event.inputBuffer.getChannelData(3);
        const waveformParameter = event.inputBuffer.getChannelData(4);
        const wrapperParameter = event.inputBuffer.getChannelData(5);
        const harmMix = event.inputBuffer.getChannelData(6);
        const output = event.outputBuffer.getChannelData(0);

        output.forEach((v, i, out) => {
            out[i] = this.generatorFunction(frequency[i], detune[i], resonance[i], pdMix[i], waveformParameter[i], wrapperParameter[i], harmMix[i]);
        });
    }

    generatorFunction (frequency, detune, resonance, pdMix, waveformParameter, wrapperParameter, harmMix) {

        let calculatedFrequency,
            calculatedResonanceFrequency,
            distortedPhaseMix;

        if (frequency === this.previous.frequency && detune === this.previous.detune) {
            calculatedFrequency = this.previous.calculatedFrequency;
        } else {
            calculatedFrequency = this.computeFrequency(frequency, detune);
            this.previous.frequency = frequency;
            this.previous.detune = detune;
        }

        if (this.previous.calculatedFrequency === calculatedFrequency && resonance === this.previous.resonance) {
            calculatedResonanceFrequency = this.previous.calculatedResonanceFrequency;
        } else {
            calculatedResonanceFrequency = calculatedFrequency * resonance;
            this.previous.calculatedResonanceFrequency = calculatedResonanceFrequency;
        }

        this.previous.calculatedFrequency = calculatedFrequency;

        this.incrementPhase(calculatedFrequency);

        switch (this.mode) {
            case OSCILLATOR_MODE.HARMONICS:
                distortedPhaseMix = mixValues(this.pdFunctions[0](this.phase), this.pdFunctions[1](this.phase), pdMix);

                // sub octave, almost for free
                const counterPhase = distortedPhaseMix + this.counter;
                const h0 = this.state.harmonics[0];
                const h1 = this.state.harmonics[1];
                const sum = h0.reduce((acc, h, i) => acc + Math.abs(mixValues(h.level, h1[i].level, harmMix)), 0);

                return h0.reduce((result, harmonic, index) => {
                    if (harmonic.enabled) {
                        const harmonicPdPhase = ((counterPhase % harmonic.denominator) * harmonic.numerator / harmonic.denominator);
                        const phaseSum = (harmonicPdPhase + (mixValues(harmonic.phase, h1[index].phase, harmMix) || 0)) % 1;
                        const harmonicPhase = (phaseSum >= 0) ? phaseSum : (1 + phaseSum);
                        const normalizedLevel = mixValues(harmonic.level, h1[index].level, harmMix) / sum;

                        return result + (this.selectedWaveform(harmonicPhase, waveformParameter) * normalizedLevel);
                    }

                    return result;
                }, 0);
                /*
                const subOctavePhase = (distortedPhaseMix + this.counter) / COUNTER_MAX;
                return (this.selectedWaveform(distortedPhaseMix) + this.selectedWaveform(subOctavePhase)) / 2;
                */

            case OSCILLATOR_MODE.RESONANT:
                this.incrementResonancePhase(calculatedResonanceFrequency);
                distortedPhaseMix = mixValues(this.pdFunctions[0](this.resonancePhase), this.pdFunctions[1](this.resonancePhase), pdMix);
                return this.selectedWaveform(distortedPhaseMix, waveformParameter) * this.selectedWrapper(this.phase, wrapperParameter);

            default:
                return 0;
        }
    }

    @autobind
    incrementPhase (frequency) {
        this.phase += (frequency / this.context.sampleRate);

        if (this.phase > 1) {
            this.resonancePhase = 0;
            this.phase %= 1;
            this.counter += 1;
            this.counter %= this.counterMax;
        }
    }

    @autobind
    incrementResonancePhase (frequency) {
        this.resonancePhase += (frequency / this.context.sampleRate);
        this.resonancePhase %= 1;
    }

    computeFrequency (frequency, detune) {
        return frequency * Math.pow(2, detune / 1200);
    }

    destroy () {
        this.constructor.inputNames.forEach(inputName => {
            this.parameters[inputName].disconnect();
            this.parameters[inputName] = null;
        });

        this.mergedInput.disconnect();
        this.mergedInput = null;
        this.generator.disconnect();
        this.generator.removeEventListener("audioprocess", this.audioprocessHandler);
        this.generator = null;
        super.destroy();

        if (this.destroyCallback && typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
    }
}


export default PDOscillator;
