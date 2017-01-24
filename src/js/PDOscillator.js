import {waveforms, wrappers} from "./waveforms";

import {mixValues, getDistortedPhase, PannableModule} from "./sharedFunctions";

import DC from "./DCGenerator";
import {BUFFER_LENGTH} from "./constants";


class PDOscillator extends PannableModule {
    constructor (context, store, frequency) {
        super();
        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.store = store;
        this.state = store.getState().patch.oscillator;
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0;
        this.pannerNode = context.createStereoPanner();
        this.pannerNode.pan.value = 0;

        // this is the output, used for muting
        this.output = context.createGain();
        this.output.gain.setValueAtTime(this.state.active ? 1 : 0, this.context.currentTime);

        // signal path: source -> gainNode -> pannerNode -> output

        this.parameters = {
            "inputs": {},
            "outputs": {}
        };
        const i = this.parameters.inputs;
        const o = this.parameters.outputs;

        // gain stage, between source and panner/output
        o.gain = this.outputNode(this.state.gain);
        this.gain = o.gain.gain;

        i.gain = this.inputNode();
        o.gain.connect(i.gain);

        i.gain.connect(this.gainNode.gain);


        o.pan = this.outputNode(this.state.pan);
        this.pan = o.pan.gain;

        i.pan = this.inputNode();
        o.pan.connect(i.pan);

        i.pan.connect(this.pannerNode.pan);

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

//        this.wrappers.gaussian = this.gaussianFunction(0.5, 0.1);

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
        if (typeof waveforms[this.state.waveform] === "function") {
            this.selectedWaveform = waveforms[this.state.waveform];
        }
        if (typeof wrappers[this.state.wrapper] === "function") {
            this.selectedWrapper = wrappers[this.state.wrapper];
        }
        this.resonanceActive = this.state.resonanceActive;

        if (!this.dc) {
            this.dc = new DC(context);
        }
        this.mergedInput = context.createChannelMerger(inputDefs.length);

        inputDefs.forEach((def, i) => {
            const nodeName = def.name + "Node";

            // output node
            this.parameters.outputs[nodeName] = this.outputNode(this.state[def.name] || def.defaultValue);
            this[def.name] = this.parameters.outputs[nodeName].gain;

            // input node
            this.parameters.inputs[def.name] = this.inputNode();

            //connect output to input
            this.parameters.outputs[nodeName].connect(this.parameters.inputs[def.name]);

            //connect input to merge node
            this.parameters.inputs[def.name].connect(this.mergedInput, null, i);
        });

        //set frequency
        this.dc.connect(this.frequency);
        this.parameters.inputs.frequency.value = 0;
        this.frequency.setValueAtTime(frequency, this.context.currentTime);

        this.mergedInput.connect(this.generator);
        this.generator.connect(this.gainNode);
    }

    start () {
        this.generator.addEventListener("audioprocess", this.audioprocessHandler);
    }

    stop () {
        this.generator.removeEventListener("audioprocess", this.audioprocessHandler);
    }

    stateChangeHandler () {
        const newState = this.store.getState().patch.oscillator;
        if (newState !== this.state) {
            if (this.panner && this.state.pan !== newState.pan) {
                this.pan.setValueAtTime(newState.pan, this.context.currentTime);
            }
            if (this.state.gain !== newState.gain) {
                this.gain.setValueAtTime(newState.gain, this.context.currentTime);
            }
            if (this.state.detune !== newState.detune) {
                this.detune.setValueAtTime(newState.detune, this.context.currentTime);
            }
            if (this.state.resonance !== newState.resonance) {
                this.resonance.setValueAtTime(newState.resonance, this.context.currentTime);
            }
            if (this.state.mix !== newState.mix) {
                this.mix.setValueAtTime(newState.mix, this.context.currentTime);
            }
            if (this.state.wrapper !== newState.wrapper) {
                if (typeof wrappers[newState.wrapper] === "function") {
                    this.selectedWrapper = this.wrappers[newState.wrapper];
                }
            }
            if (this.state.waveform !== newState.waveform) {
                if (typeof waveforms[newState.waveform] === "function") {
                    this.selectedWaveform = waveforms[newState.waveform];
                }
            }
            if (this.state.resonanceActive !== newState.resonanceActive) {
                this.resonanceActive = newState.resonanceActive;
            }

            this.state = newState;
        }
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

    destroy () {
        this.parameters.inputs.frequency.disconnect();
        this.parameters.inputs.frequency = null;
        this.parameters.inputs.detune.disconnect();
        this.parameters.inputs.detune = null;
        this.parameters.inputs.resonance.disconnect();
        this.parameters.inputs.resonance = null;
        this.parameters.inputs.mix.disconnect();
        this.parameters.inputs.mix = null;
        this.mergedInput.disconnect();
        this.mergedInput = null;
        this.generator.disconnect();
        this.generator.removeEventListener("audioprocess", this.audioprocessHandler);
        this.generator = null;
        if (this.destroyCallback && typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
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


            /*
            let debugVisible = true,

            if (debugVisible) {
                    console.log("mix: " + mix[0] + " resonance: " + resonance[0] + " detune: " + detune[0]);

                debugVisible = false;
            }

            */

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

    set waveform (waveformName) {
        if (waveformName && waveforms[waveformName] && typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName];
        }
        return this;
    }

    set wrapper (wrapperName) {
        if (wrapperName && wrappers[wrapperName] && typeof wrappers[wrapperName] === "function") {
            this.selectedWrapper = wrappers[wrapperName];
        }
        return this;
    }

    set freq (frequency) {
        this.frequency.setValueAtTime(frequency, this.context.currentTime);
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

    gaussianFunction (mu, sig) {
        let twoSigSquared = 2 * Math.pow(sig, 2),
            muSquared = mu * mu;

        return function (phase) {
            return Math.exp(-(muSquared - (2 * mu * phase) + (phase * phase)) / twoSigSquared);
        };
    }

    getStaticParameters () {

        const result = {
            "gain": this.gainNode,
            "detune": this.detuneNode,
            "frequency": this.frequencyNode,
            "resonance": this.resonanceNode,
            "mix": this.mixNode
        };
        if (this.pan) {
            result.pan = this.panNode;
        }
        return result;
    }
}


export default PDOscillator;
