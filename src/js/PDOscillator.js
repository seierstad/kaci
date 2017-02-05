import {waveforms, wrappers} from "./waveforms";

import {ParamLogger, mixValues, getDistortedPhase, inputNode, outputNode} from "./sharedFunctions";

import DC from "./DCGenerator";
import {BUFFER_LENGTH} from "./constants";


class PDOscillator {
    constructor (context, patch, frequency) {
        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.state = patch;

        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0;
        this.pannerNode = context.createStereoPanner();
        this.pannerNode.pan.value = 0;

        // this is the output, used for muting
        this.output = context.createGain();

        // signal path: source -> gainNode -> pannerNode -> output

        this.parameters = {
            "targets": {}
        };
        const targets = this.parameters.targets;
        targets.gain = inputNode(context);
        targets.gain.connect(this.gainNode.gain);
        targets.pan = inputNode(context);
        targets.pan.connect(this.pannerNode.pan);

        //connect signal path
        this.gainNode.connect(this.pannerNode);
        this.pannerNode.connect(this.output);


        /* end common constructor code */


        const inputDefs = [{
            name: "frequency",
            defaultValue: frequency || 440
        }, {
            name: "detune",
            defaultValue: 0
        }, {
            name: "resonance",
            defaultValue: 1
        }, {
            name: "mix",
            defaultValue: 0
        }];

        this.audioprocessHandler = this.getAudioProcessor(this);

        this.generator = context.createScriptProcessor(BUFFER_LENGTH, inputDefs.length, 1);

        const that = this;

        this.pdEnvelope0 = [];
        this.pdEnvelope1 = [];

        this.state.pd[0].steps.forEach(function (point) {
            that.pdEnvelope0.push([point[0], point[1]]);
        });

        this.pdEnvelope0.functions = [];
        this.state.pd[1].steps.forEach(function (point) {
            that.pdEnvelope1.push([point[0], point[1]]);
        });
        this.pdEnvelope1.functions = [];

        this.phase = 0;
        this.resonancePhase = 0;
        this.sampleAndHoldBuffer = {
            value: null,
            phase: 0
        };


        this.mergedInput = context.createChannelMerger(inputDefs.length);

        inputDefs.forEach((def, i) => {
            const nodeName = def.name + "Node";
            const targets = this.parameters.targets;
            targets[def.name] = inputNode(context);

            //connect input to merge node
            targets[def.name].connect(this.mergedInput, null, i);
        });

        //set frequency
        this.dc.connect(targets.frequency);
        targets.frequency.gain.value = 440;

        this.mergedInput.connect(this.generator);
        this.generator.connect(this.gainNode);

        this.frequency = frequency;
        this.active = patch.active;
        this.waveform = patch.waveform;
        this.resonanceActive = patch.resonanceActive;
        this.wrapper = patch.wrapper;
    }

    start () {
        this.generator.addEventListener("audioprocess", this.audioprocessHandler);
    }

    stop () {
        this.generator.removeEventListener("audioprocess", this.audioprocessHandler);
        this.phase = 0;
        this.resonancePhase = 0;
    }

    setPDEnvelope0 (data) {
        this.pdEnvelope0 = [];

        data.forEach(function (point) {
            this.pdEnvelope0.push([point[0], point[1]]);
        }, this);

        this.pdEnvelope0.functions = [];
    }

    setPDEnvelope1 (data) {
        this.pdEnvelope1 = [];

        data.forEach(function (point) {
            this.pdEnvelope1.push([point[0], point[1]]);
        }, this);

        this.pdEnvelope1.functions = [];
    }

    addPDEnvelopePoint (id, index, data) {
        this["pdEnvelope" + id].splice(index, 0, data);
        this["pdEnvelope" + id].functions = [];
    }

    movePDEnvelopePoint (id, index, data) {
        this["pdEnvelope" + id][index] = data;
        this["pdEnvelope" + id].functions = [];
    }

    deletePDEnvelopePoint (id, index) {
        this["pdEnvelope" + id].splice(index, 1);
        this["pdEnvelope" + id].functions = [];
    }

    getChangeWaveformHandler (osc) {
        return function (evt) {
            osc.setWaveform(evt.detail);
        };
    }

    getAudioProcessor (oscillator) {

        return (evt) => {
            const frequency = evt.inputBuffer.getChannelData(0);
            const detune = evt.inputBuffer.getChannelData(1);
            const resonance = evt.inputBuffer.getChannelData(2);
            const mix = evt.inputBuffer.getChannelData(3);
            const output = evt.outputBuffer.getChannelData(0);

            const previous = {
                frequency: 0,
                detune: 0,
                resonance: 0,
                calculatedFrequency: 0,
                calculatedResonanceFrequency: 0
            };

            for (let i = 0; i < BUFFER_LENGTH; i += 1) {
                let calculatedFrequency,
                    calculatedResonanceFrequency,
                    distortedPhase0,
                    distortedPhase1,
                    distortedPhaseMix;

                if (frequency[i] === previous.frequency && detune[i] === previous.detune) {
                    calculatedFrequency = previous.calculatedFrequency;
                } else {
                    calculatedFrequency = oscillator.getComputedFrequency(frequency[i], detune[i]);
                    previous.frequency = frequency[i];
                    previous.detune = detune[i];
                }
                if (previous.calculatedFrequency === calculatedFrequency && resonance[i] === previous.resonance) {
                    calculatedResonanceFrequency = previous.calculatedFrequency;
                } else {
                    calculatedResonanceFrequency = calculatedFrequency * resonance[i];
                }
                previous.calculatedFrequency = calculatedFrequency;

                const phase = oscillator.getIncrementedPhase(calculatedFrequency);


                if (!oscillator.resonanceActive) {
                    distortedPhase0 = getDistortedPhase(phase, oscillator.pdEnvelope0);
                    distortedPhase1 = getDistortedPhase(phase, oscillator.pdEnvelope1);
                    distortedPhaseMix = mixValues(distortedPhase0, distortedPhase1, mix[i]);

                    output[i] = oscillator.selectedWaveform.call(oscillator, distortedPhaseMix);
                } else {
                    const wrapperPhase = oscillator.getIncrementedResonancePhase(calculatedResonanceFrequency);
                    distortedPhase0 = getDistortedPhase(wrapperPhase, oscillator.pdEnvelope0);
                    distortedPhase1 = getDistortedPhase(wrapperPhase, oscillator.pdEnvelope1);
                    distortedPhaseMix = mixValues(distortedPhase0, distortedPhase1, mix[i]);

                    output[i] = oscillator.selectedWaveform(distortedPhaseMix) * oscillator.selectedWrapper(phase);
                }
            }
        };
    }

    set active (active) {
        this.output.gain.setValueAtTime(this.state.active ? 1 : 0, this.context.currentTime);
    }

    set waveform (waveformName) {
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    set wrapper (wrapperName) {
        if (typeof wrappers[wrapperName] === "function") {
            this.selectedWrapper = wrappers[wrapperName]();
        }
    }

    set frequency (frequency) {
        this.parameters.targets.frequency.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    getIncrementedPhase (frequency) {
        const increment = frequency / this.context.sampleRate;
        this.phase += increment;

        if (this.phase > 1) {
            this.resonancePhase = 0;
        }
        return this.phase %= 1;
    }

    getIncrementedResonancePhase (frequency) {
        const increment = frequency / this.context.sampleRate;
        this.resonancePhase += increment;
        return this.resonancePhase %= 1;
    }

    getComputedFrequency (frequency, detune) {
        return frequency * Math.pow(2, detune / 1200);
    }

    connect (node) {
        this.output.connect(node);
    }

    disconnect () {
        this.output.disconnect();
    }

    destroy () {
        this.parameters.targets.frequency.disconnect();
        this.parameters.targets.frequency = null;
        this.parameters.targets.detune.disconnect();
        this.parameters.targets.detune = null;
        this.parameters.targets.resonance.disconnect();
        this.parameters.targets.resonance = null;
        this.parameters.targets.mix.disconnect();
        this.parameters.targets.mix = null;
        this.mergedInput.disconnect();
        this.mergedInput = null;
        this.generator.disconnect();
        this.generator.removeEventListener("audioprocess", this.audioprocessHandler);
        this.generator = null;
        if (this.destroyCallback && typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
    }
}


export default PDOscillator;
