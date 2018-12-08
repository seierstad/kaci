import autobind from "autobind-decorator";
import KaciAudioNode from "../kaci-audio-node";
import {BUFFER_LENGTH} from "../constants";
import {
    mixValues,
    phaseDistortionFunction,
    inputNode,
    lcmReducer,
    fractionsLcm
} from "../shared-functions";
import {waveforms, wrappers} from "./waveforms";
import {OSCILLATOR_MODE} from "./constants";


class PDOscillator extends KaciAudioNode {
    static inputNames = [
        "frequency",
        "detune",
        "resonance",
        "mix"
    ];

    constructor (...args) {
        super(...args);

        const [context, store, patch] = args;
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
        const {harmonics = []} = this.state;

        this.counterMax = fractionsLcm(harmonics);

        this.mergedInput.connect(this.generator);
        this.generator.connect(this.outputStage.input);

        this.pd = patch.pd;
        this.active = patch.active;
        this.waveform = patch.waveform;
        this.mode = patch.mode;
        this.wrapper = patch.wrapper;
    }

    get targets () {
        return this.parameters;
    }

    set waveform (waveformName) {
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    set wrapper (wrapper) {
        if (typeof wrapper === "string") {
            if (typeof wrappers[wrapper] === "function") {
                this.selectedWrapper = wrappers[wrapper]();
            }
        } else if (wrapper.name && typeof wrappers[wrapper.name] === "function") {
            this.selectedWrapper = wrappers[wrapper.name](wrapper.parameters);
        }
    }

    set mode (mode) {
        this.state.mode = mode;
    }

    get mode () {
        return this.state.mode;
    }

    set harmonics (harmonics) {
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
        return new Promise((resolve, reject) => {
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
        const mix = event.inputBuffer.getChannelData(3);
        const output = event.outputBuffer.getChannelData(0);

        output.forEach((v, i, out) => {
            out[i] = this.generatorFunction(frequency[i], detune[i], resonance[i], mix[i]);
        });
    }

    generatorFunction (frequency, detune, resonance, mix) {

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
                distortedPhaseMix = mixValues(this.pdFunctions[0](this.phase), this.pdFunctions[1](this.phase), mix);

                // sub octave, almost for free
                const counterPhase = distortedPhaseMix + this.counter;
                const sum = this.state.harmonics.reduce((acc, h) => acc + Math.abs(h.level), 0);

                return this.state.harmonics.reduce((result, harmonic, index) => {
                    if (harmonic.enabled && harmonic.level > 0) {
                        const harmonicPdPhase = ((counterPhase % harmonic.denominator) * harmonic.numerator / harmonic.denominator);
                        const phaseSum = (harmonicPdPhase + (harmonic.phase || 0)) % 1;
                        const harmonicPhase = (phaseSum >= 0) ? phaseSum : (1 + phaseSum);
                        const normalizedLevel = harmonic.level / sum;

                        return result + (this.selectedWaveform(harmonicPhase) * normalizedLevel);
                    }

                    return result;
                }, 0);
                /*
                const subOctavePhase = (distortedPhaseMix + this.counter) / COUNTER_MAX;
                return (this.selectedWaveform(distortedPhaseMix) + this.selectedWaveform(subOctavePhase)) / 2;
                */

            case OSCILLATOR_MODE.RESONANT:
                this.incrementResonancePhase(calculatedResonanceFrequency);
                distortedPhaseMix = mixValues(this.pdFunctions[0](this.resonancePhase), this.pdFunctions[1](this.resonancePhase), mix);
                return this.selectedWaveform(distortedPhaseMix) * this.selectedWrapper(this.phase);

            default:
                return 0;
        }
    }

    incrementPhase (frequency) {
        this.phase += (frequency / this.context.sampleRate);

        if (this.phase > 1) {
            this.resonancePhase = 0;
            this.phase %= 1;
            this.counter += 1;
            this.counter %= this.counterMax;
        }
    }

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
