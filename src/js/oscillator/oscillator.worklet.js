import {boundMethod} from "autobind-decorator";
import {waveforms} from "../waveform/waveforms";

class OscillatorWorkletProcessor extends AudioWorkletProcessor {

    // Static getter to define AudioParam objects in this custom processor.
    static get parameterDescriptors () {
        return [{
            name: "frequency",
            defaultValue: .4
        }, {
            name: "detune",
            defaultValue: 0
        }, {
            name: "waveformParameter",
            defaultValue: 4
        }];
    }


    constructor () {
        super();
        this.phase = 0;
        this.paused = true;
        this.destroyed = false;
        this.scaleBase = 2;
        this.sampleRate = 44100;

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
            sampleRate,
            waveform,
            command = ""
        } = JSON.parse(event.data);

        if (command === "start") {
            if (this.paused) {
                this.paused = false;
            } else {
                this.phase = 0;
            }
        }

        if (command === "destroy") {
            this.destroyed = true;
        }

        if (sampleRate) {
            this.sampleRate = sampleRate;
        }

        if (waveform && typeof waveforms[waveform] === "function") {
            this.selectedWaveform = waveforms[waveform];
        }
    }

    getComputedFrequency (scaleBase, frequency, detune) {
        return frequency * Math.pow(scaleBase, detune / 1200);
    }

    incrementPhase (frequency) {
        let increment = frequency / this.sampleRate;
        this.phase += increment;

        if (this.phase > 1) {
            this.phase %= 1;
            //this.zeroPhaseActions();
        }
    }

    generatorFunction (frequency, detune, parameter = null) {
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
        const result = (parameter === null) ? this.selectedWaveform()(this.phase) : this.selectedWaveform(parameter)(this.phase);

        if (!this.paused) {
            this.incrementPhase(calculatedFrequency);
        }

        return result;

    }

    process (inputs, outputs, parameters) {
        const outputChannel = outputs[0][0];
        const {frequency, detune, waveformParameter} = parameters;

        outputChannel.forEach((val, index, arr) => {
            const {[index]: f = frequency[0]} = frequency;
            const {[index]: d = detune[0]} = detune;
            const {[index]: p = waveformParameter[0]} = waveformParameter;

            arr[index] = this.generatorFunction(f, d, p);
        });

        return !this.destroyed;
    }
}


registerProcessor("oscillator-worklet-processor", OscillatorWorkletProcessor);

