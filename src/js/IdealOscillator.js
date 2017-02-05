import DCGenerator from "./DCGenerator";
import {BUFFER_LENGTH} from "./constants";
import {waveforms} from "./waveforms";
import {PannableModule} from "./sharedFunctions";


class IdealOscillator {
    constructor (context, dc) {

        this.context = context;

        this.inputDefs = [{
            name: "frequency",
            defaultValue: 10
        }, {
            name: "detune",
            defaultValue: 0
        }];

        this.phase = 0;
        this.paused = false;

        this.sampleAndHoldBuffer = {
            value: null,
            phase: 0
        };

        this.dc = dc || new DCGenerator(context);
        this.mergedInput = context.createChannelMerger(this.inputDefs.length);

        this.inputDefs.forEach((def, i) => {
            const nodeName = def.name + "Node";

            this[nodeName] = context.createGain();
            this.dc.connect(this[nodeName]);
            this[def.name] = this[nodeName].gain;
            this[def.name].value = def.defaultValue;
            this[nodeName].connect(this.mergedInput, null, i);
        });

        this.generator = context.createScriptProcessor(BUFFER_LENGTH, this.inputDefs.length, 1);
        this.mergedInput.connect(this.generator);

        this.getIncrementedPhase = this.getIncrementedPhase.bind(this);

        this.getAudioProcessHandler = this.getAudioProcessHandler.bind(this);
        this.handleAudioProcess = this.getAudioProcessHandler();
    }

    getAudioProcessHandler () {
        const previous = {
            "frequency": 0,
            "detune": 0,
            "calculatedFrequency": 0
        };
        const oscillator = this;

        return (evt) => {
            const frequency = evt.inputBuffer.getChannelData(0);
            const detune = evt.inputBuffer.getChannelData(1);
            const output = evt.outputBuffer.getChannelData(0);
            let calculatedFrequency;

            for (let i = 0; i < BUFFER_LENGTH; i += 1) {
                if (frequency[i] === previous.frequency && detune[i] === previous.detune) {
                    calculatedFrequency = previous.calculatedFrequency;
                } else {
                    calculatedFrequency = oscillator.getComputedFrequency(frequency[i], detune[i]);
                    previous.frequency = frequency[i];
                    previous.detune = detune[i];
                    previous.calculatedFrequency = calculatedFrequency;
                }
                const phase = oscillator.getIncrementedPhase(calculatedFrequency);
                output[i] = oscillator.selectedWaveform.call(oscillator, phase);
            }
        };
    }

    start () {
        if (!this.paused) {
            this.resetPhase();
        }
        this.generator.onaudioprocess = this.handleAudioProcess;
        // this.generator.onaudioprocess = this.getAudioProcessHandler(this);
        //    this.generator.addEventListener("audioprocess", this.getGenerator(this));
    }

    stop () {
        this.generator.onaudioprocess = null;

    //    this.generator.removeEventListener("audioprocess");
    }

    getIncrementedPhase (frequency) {
        let increment = frequency / this.context.sampleRate;
        this.phase += increment;
        if (this.phase > 1) {
            while (this.phase > 1) {
                this.phase -= 1;
            }
            this.zeroPhaseActions();
        }
        return this.phase;
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

    setWaveform (waveformName) {
        if (typeof waveforms[waveformName] === "function") {
            this.selectedWaveform = waveforms[waveformName]();
        }
    }

    destroy () {
        this.generator.onaudioprocess = null;
        this.dc = null;

        this.inputDefs.forEach((def) => {
            this[def.name + "Node"].disconnect();
            this[def.name] = null;
            this[def.name + "Node"] = null;
        });

        this.mergedInput.disconnect();
        this.mergedInput = null;

        this.generator.disconnect();
        this.generator = null;
    }
}


export default IdealOscillator;
