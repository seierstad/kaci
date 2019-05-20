/*global currentTime */

import {boundMethod} from "autobind-decorator";
import {waveforms} from "../waveform/waveforms";

class OscillatorWorkletProcessor extends AudioWorkletProcessor {

    // Static getter to define AudioParam objects in this custom processor.
    static get parameterDescriptors () {
        return [{
            name: "frequency",
            defaultValue: .4,
            minValue: 0,
            maxValue: 100000,
            automationRate: "a-rate"
        }, {
            name: "detune",
            defaultValue: 0,
            minValue: -1000000,
            maxValue: 100000,
            automationRate: "a-rate"
        }, {
            name: "waveformParameter",
            defaultValue: 4,
            minValue: 0,
            maxValue: 100,
            automationRate: "a-rate"
        }];
    }


    constructor () {
        super();
        this.phase = 0;
        this.paused = true;
        this.destroyed = false;
        this.scaleBase = 2;
        this.sampleRate = 44100;
        this.zeroPhaseRequested = false;

        this.previous = {
            "frequency": 0,
            "detune": 0,
            "calculatedFrequency": 0
        };

        // initialize with silence generator
        this.selectedWaveform = waveforms["square"];
        this.port.onmessage = this.messageHandler;

    }

    @boundMethod
    messageHandler (event) {
        const {
            command = "",
            message,
            sampleRate,
            waveform
        } = JSON.parse(event.data);

        if (command === "start") {
            if (this.paused) {
                this.paused = false;
            } else {
                this.phase = 0;
            }
        }

        if (command === "resetPhase") {
            this.phase = 0;
        }

        if (command === "destroy") {
            this.destroyed = true;
        }

        if (sampleRate) {
            this.sampleRate = sampleRate;
        }

        if (waveform && typeof waveforms[waveform.name] === "function") {
            this.selectedWaveform = waveforms[waveform.name](waveform.parameter);
        }

        if (command === "requestZeroPhaseResponse") {
            this.zeroPhaseMessages.push(message);
        }
    }

    sendZeroPhaseMessage (timestamp, phase) {
        this.port.postMessage(String.toJSON({timestamp, phase}));
        this.zeroPhaseRequested = false;
    }

    getComputedFrequency (scaleBase, frequency, detune) {
        return frequency * Math.pow(scaleBase, detune / 1200);
    }

    incrementPhase (frequency) {
        let increment = frequency / this.sampleRate;
        this.phase += increment;

        if (this.phase > 1) {
            this.phase %= 1;
            if (this.zeroPhaseRequested) {
                this.sendZeroPhaseMessage(currentTime, this.phase);
            }
        }
    }

    generatorFunction (frequency, detune) {
        let calculatedFrequency;

        if (frequency === this.previous.frequency
            && detune === this.previous.detune
            && this.scaleBase === this.previous.scaleBase
        ) {
            calculatedFrequency = this.previous.calculatedFrequency;
        } else {
            calculatedFrequency = this.getComputedFrequency(this.scaleBase, frequency, detune);
            this.previous = {
                frequency,
                detune,
                scaleBase: this.scaleBase,
                calculatedFrequency
            };
        }
        const result = this.selectedWaveform(this.phase);

        if (!this.paused) {
            this.incrementPhase(calculatedFrequency);
        }

        return result;

    }

    process (inputs, outputs, parameters) {
        const audioOutputChannel = outputs[0][0];
        /*
        const syncOutput = outputs[1];
        const syncFrequencyChannel = syncOutput[0];
        const syncPhaseChannel = syncOutput[1];
        */
        const {frequency, detune, waveformParameter} = parameters;

        audioOutputChannel.forEach((val, index, arr) => {
            const {[index]: f = frequency[0]} = frequency;
            const {[index]: d = detune[0]} = detune;
            const {[index]: p = waveformParameter[0]} = waveformParameter;

            //syncPhaseChannel[index] = this.phase;
            arr[index] = this.generatorFunction(f, d, p);
            //syncFrequencyChannel[index] = this.previous.calculatedFrequency;
        });

        return !this.destroyed;
    }
}


registerProcessor("oscillator-worklet-processor", OscillatorWorkletProcessor);

