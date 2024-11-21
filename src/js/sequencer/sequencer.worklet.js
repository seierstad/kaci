/*global currentTime, sampleRate */

import {boundMethod} from "autobind-decorator";


class SequenceWorkletProcessor extends AudioWorkletProcessor {

    // Static getter to define AudioParam objects in this custom processor.
    static get parameterDescriptors () {
        return [{
            name: "frequency",
            defaultValue: .4,
            minValue: 0,
            maxValue: 100000,
            automationRate: "a-rate"
        }];
    }


    constructor () {
        super();
        this.sequence = [[0, true]];
        this.maxValue = 1;
        // minValue is always 0
        this.valueFactor = 2;
        this.phase = 0;
        this.paused = true;
        this.destroyed = false;
        this.zeroPhaseRequested = false;
        this.speedUnit = 0;
        this.speedUnitRatio = (this.speedUnit === 0) ? 1 : (this.sequence.length / this.speedUnit);
        this.sync = {
            enabled: false,
            numerator: 1,
            denominator: 1
        };
        this.syncFraction = 1;
        this.glide = {
            up: {
                time: 0.5,
                active: true,
                slope: "linear"
            },
            down: {
                time: 0.5,
                active: true,
                slope: "linear"
            }
        };

        this.glideState = {
            diff: 0,
            prevIndex: 0,
            previousValue: 0
        };

        // initialize with silence generator
        this.port.onmessage = this.messageHandler;

    }

    @boundMethod
    resetPhase () {
        this.phase = 0;
        this.glideState.previousValue = 0;
        this.glideState.previousIndex = 0;
        this.glideState.diff = 0;
    }

    @boundMethod
    messageHandler (event) {
        const {
            command = "",
            message
        } = JSON.parse(event.data);

        if (command === "start") {
            if (this.paused) {
                this.paused = false;
            } else {
                this.resetPhase();
            }
        }

        if (command === "stop") {
            this.paused = true;
            this.resetPhase();
        }

        if (command === "pause") {
            this.paused = true;
        }

        if (command === "resetPhase") {
            this.resetPhase();
        }

        if (command === "destroy") {
            this.destroyed = true;
        }

        if (command === "speedUnit") {
            this.speedUnit = message;
            this.speedUnitRatio = (this.speedUnit === 0) ? 1 : (this.speedUnit / this.sequence.length);
        }

        if (command === "setMaxValue") {
            this.maxValue = message;
            this.valueFactor = 2 / this.maxValue;
        }

        if (command === "setSequence") {
            if (this.sequence.length !== message.length) {
                this.phase = (this.sequence.length * this.phase) / message.length;
                this.speedUnitRatio = (this.speedUnit === 0) ? 1 : (this.speedUnit / message.length);
            }
            this.sequence = message;
        }

        if (command === "requestZeroPhaseResponse") {
            this.zeroPhaseMessages.push(message);
        }

        if (command === "sync") {
            this.sync = message;
            this.syncFraction = this.sync.numerator / this.sync.denominator;
        }

        if (command === "glide") {
            this.glide = message;
        }
    }

    sendZeroPhaseMessage (timestamp, phase) {
        this.port.postMessage(String.toJSON({timestamp, phase}));
        this.zeroPhaseRequested = false;
    }

    incrementPhase (frequency) {
        let increment = frequency / sampleRate;
        this.phase += increment;

        if (this.phase > 1) {
            this.phase %= 1;
            if (this.zeroPhaseRequested) {
                this.sendZeroPhaseMessage(currentTime, this.phase);
            }
        }
    }

    generatorFunction (frequency) {
        const sequencePosition = this.phase * this.sequence.length;
        const sequenceIndex = (Math.floor(sequencePosition) < this.sequence.length) ? Math.floor(sequencePosition) : 0;

        const [stepValue, stepGlide] = this.sequence[sequenceIndex];
        let glideValue = 0;

        // check if new step
        if (sequenceIndex !== this.glideState.prevIndex) {
            // set glide variables
            const prevValue = (this.glideState.prevIndex < this.sequence.length) ? this.sequence[this.glideState.prevIndex][0] : this.sequence[this.sequence.length - 1][0];
            this.glideState.diff = stepValue - prevValue;
            this.glideState.prevIndex = sequenceIndex;

        }

        if (stepGlide && this.glideState.diff !== 0) {
            // glide is enabled in the current direction
            const stepPosition = sequencePosition - sequenceIndex;
            let time = 0;

            if (this.glideState.diff > 0) {
                time = this.glide.up.time;
            } else {
                time = this.glide.down.time;
            }
            const remainingGlideTime = time - stepPosition;
            glideValue = this.glideState.diff * remainingGlideTime / time;

            if (remainingGlideTime <= 0) {
                glideValue = 0;
                this.glideState.diff = 0;
            }
        }

        const result = (stepValue - glideValue) * this.valueFactor - 1;

        if (!this.paused) {
            this.incrementPhase(frequency);
        }

        return result;
    }

    process (inputs, outputs, parameters) {
        const syncInputFrequency = inputs[0][0];

        // future use: accurate phase sync
        //const syncInputPhase = inputs[1];


        const signalOutputChannel = outputs[0][0];

        const syncOutput = outputs[1];
        const syncOutputFrequencyChannel = syncOutput[0];
        const syncOutputPhaseChannel = syncOutput[1];

        const {frequency} = parameters;

        signalOutputChannel.forEach((val, index, arr) => {
            const {[index]: fParam = frequency[0]} = frequency;
            const {[index]: fSync = syncInputFrequency[0]} = syncInputFrequency;

            const f = this.speedUnitRatio * (this.sync.enabled ? (fSync * this.syncFraction) : fParam);

            syncOutputPhaseChannel[index] = this.phase;
            arr[index] = this.generatorFunction(f);
            syncOutputFrequencyChannel[index] = f;
        });

        return !this.destroyed;
    }
}


registerProcessor("sequencer-worklet-processor", SequenceWorkletProcessor);
