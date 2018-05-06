import autobind from "autobind-decorator";
import {BUFFER_LENGTH} from "../constants";
import {inputNode} from "../shared-functions";
import KaciNode from "../kaci-node";

class Oscillator extends KaciNode {

    static inputDefs = [
        {
            name: "frequency",
            defaultValue: 10
        }, {
            name: "detune",
            defaultValue: 0
        }
    ];

    constructor (...args) {
        super(...args);

        this.phase = 0;
        this.paused = false;

        this.mergedInput = this.context.createChannelMerger(this.constructor.inputDefs.length);

        this.parameters = {};

        const p = this.parameters;
        this.constructor.inputDefs.forEach((def, i) => {
            p[def.name] = inputNode(this.context, this.dc);
            p[def.name].gain.setValueAtTime(def.defaultValue, this.context.currentTime);
            this.dc.connect(p[def.name]);
            p[def.name].connect(this.mergedInput, null, i);
        });

        this.previous = {
            "frequency": 0,
            "detune": 0,
            "calculatedFrequency": 0
        };

        this.generator = this.context.createScriptProcessor(BUFFER_LENGTH, this.constructor.inputDefs.length, 1);
        this.mergedInput.connect(this.generator);
    }

    set frequency (frequency) {
        this.parameters.frequency.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    get targets () {
        return this.parameters.targets;
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

    start () {
        if (!this.paused) {
            this.resetPhase();
        }
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }

    stop () {
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

        this.constructor.inputDefs.forEach((def) => {
            this.parameters[def.name].disconnect();
            this.parameters[def.name] = null;
        });

        this.mergedInput.disconnect();
        this.mergedInput = null;

        this.generator.disconnect();
        this.generator = null;
    }
}


export default Oscillator;
