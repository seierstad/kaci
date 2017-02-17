import DCGenerator from "./DCGenerator";
import {BUFFER_LENGTH} from "./constants";
import {waveforms} from "./waveforms";
import {PannableModule, inputNode} from "./sharedFunctions";


class IdealOscillator {

    static inputDefs = [
        {
            name: "frequency",
            defaultValue: 10
        }, {
            name: "detune",
            defaultValue: 0
        }
    ];

    constructor (context, dc) {

        this.context = context;
        this.dc = dc;
        this.audioProcessHandler = this.audioProcessHandler.bind(this);


        this.phase = 0;
        this.paused = false;

        this.sampleAndHoldBuffer = {
            value: null,
            phase: 0
        };

        this.previous = {
            "frequency": 0,
            "detune": 0,
            "calculatedFrequency": 0
        };

        this.mergedInput = context.createChannelMerger(IdealOscillator.inputDefs.length);

        this.parameters = {};

        const p = this.parameters;
        IdealOscillator.inputDefs.forEach((def, i) => {
            p[def.name] = inputNode(context, dc);
            p[def.name].gain.value = def.defaultValue;
            dc.connect(p[def.name]);
            p[def.name].connect(this.mergedInput, null, i);
        });

        this.generator = context.createScriptProcessor(BUFFER_LENGTH, IdealOscillator.inputDefs.length, 1);
        this.mergedInput.connect(this.generator);
    }

    set frequency (frequency) {
        this.parameters.frequency.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    set waveform (waveformName) {
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    get targets () {
        return this.parameters.targets;
    }

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

    start () {
        if (!this.paused) {
            this.resetPhase();
        }
        // this.generator.onaudioprocess = this.handleAudioProcess;
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }

    stop () {
        //this.generator.onaudioprocess = null;

        this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
    }

    incrementPhase (frequency) {
        let increment = frequency / this.context.sampleRate;
        this.phase += increment;

        if (this.phase > 1) {
            this.phase %= 1;
            this.zeroPhaseActions();
        }
    }

    getComputedFrequency (frequency, detune) {
        return frequency * Math.pow(2, detune / 1200);
    }

    requestZeroPhaseEvent (eventName) {

        if (!this.zeroPhaseEventRequested) {
            this.zeroPhaseEventRequested = [];
        }
        if (this.zeroPhaseEventRequested.indexOf(eventName) === -1) {
            this.zeroPhaseEventRequested.push(eventName);
        }
    }

    zeroPhaseActions () {
        if (this.zeroPhaseEventRequested) {
            this.zeroPhaseEventRequested.forEach((evt) => {
                const event = new CustomEvent(evt, {
                    detail: this.frequency.value
                });
                this.context.dispatchEvent(event);
            });
            this.zeroPhaseEventRequested = false;
        }
    }

    resetPhase () {
        this.phase = 0;
        this.sampleAndHoldBuffer.phase = 0;
        this.zeroPhaseActions();
    }

    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.generator.connect(node.input);
        } else {
            this.generator.connect(node);
        }
    }

    disconnect () {
        this.generator.disconnect();
    }

    destroy () {
        this.generator.onaudioprocess = null;

        IdealOscillator.inputDefs.forEach((def) => {
            this.parameters[def.name].disconnect();
            this.parameters[def.name] = null;
        });

        this.mergedInput.disconnect();
        this.mergedInput = null;

        this.generator.disconnect();
        this.generator = null;
    }
}


export default IdealOscillator;
