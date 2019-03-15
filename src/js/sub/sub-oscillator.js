import autobind from "autobind-decorator";
import KaciAudioNode from "../kaci-audio-node";

import {inputNode} from "../shared-functions";


class SubOscillator extends KaciAudioNode {

    static inputNames = [
        "detune",
        "beat"
    ];

    static gains = [
        "frequency",
        "detuneMultiplier",
        "detune",
        "beat",
        "ratio"
    ];

    constructor (...args) {
        super(...args);
        const [context, , patch, scaleBaseNumber = 2] = args;

        /* start common constructor code */
        this.state = {
            ...patch,
            sync: {
                ...patch.sync
            }
        };

        this.parameters = {...this.outputStage.targets};


        this.constructor.inputNames.forEach(inputName => {
            this.parameters[inputName] = inputNode(this.context);
        });


        // simple oscillator
        this.generator = context.createOscillator();
        this.generator.frequency.setValueAtTime(0, this.context.currentTime);
        this.generator.type = "sine";


        SubOscillator.gains.forEach(name => {
            this[name + "Node"] = context.createGain();
            this[name + "Node"].gain.setValueAtTime(0, this.context.currentTime);
        });

        this.parameters.beat.connect(this.beatNode.gain);
        this.parameters.detune.connect(this.detuneNode.gain);

        // connect dc
        this.dc.connect(this.frequencyNode);
        this.dc.connect(this.beatNode);
        this.dc.connect(this.detuneNode);

        this.detuneNode.connect(this.detuneMultiplierNode);
        // multiply semitones by 100 to get cents
        this.detuneMultiplierNode.gain.setValueAtTime(100, context.currentTime);
        this.detuneMultiplierNode.connect(this.generator.detune);

        this.frequencyNode.gain.setValueAtTime(1, this.context.currentTime);
        this.frequencyNode.connect(this.ratioNode);
        this.beatNode.connect(this.ratioNode);
        this.ratioNode.connect(this.generator.frequency);
        this.generator.connect(this.outputStage.input);

        //this.frequency = frequency;
        this.scaleBaseNumber = scaleBaseNumber;
        this.depth = patch.depth;
        this.mode = patch.mode;
        this.active = patch.active;
    }

    get targets () {
        return this.parameters;
    }

    /*
    set frequency (frequency) {
        this.frequencyNode.gain.setValueAtTime(frequency, this.context.currentTime);
    }
    */

    set scaleBaseNumber (scaleBaseNumber) {
        this.ratioNode.gain.setValueAtTime(Math.pow(scaleBaseNumber, this.state.depth), this.context.currentTime);
        this.state.scaleBaseNumber = scaleBaseNumber;
    }

    set depth (depth) {
        this.ratioNode.gain.setValueAtTime(Math.pow(this.state.scaleBaseNumber, depth), this.context.currentTime);
        this.state.depth = depth;
    }

    set mode (mode) {
        if (mode === "beat") {
            this.beatNode.gain.setValueAtTime(this.state.beat, this.context.currentTime);
            this.parameters.beat.connect(this.beatNode.gain);

            this.parameters.detune.disconnect(this.detuneNode.gain);
            this.detuneMultiplierNode.gain.setValueAtTime(0, this.context.currentTime);

        } else if (mode === "semitone") {
            this.parameters.beat.disconnect();
            this.beatNode.gain.setValueAtTime(0, this.context.currentTime);

            this.detuneMultiplierNode.gain.setValueAtTime(100, this.context.currentTime);
            this.parameters.detune.connect(this.detuneNode.gain);
        }

        this.state.mode = mode;
    }

    @autobind
    init () {
        return new Promise((resolve) => {
            resolve(this);
        });
    }

    start () {
        this.generator.start();
    }

    stop () {
        this.generator.stop();
    }

    destroy () {
        this.frequencyNode.disconnect();
        this.frequencyNode = null;
        this.ratioNode.disconnect();
        this.ratioNode = null;
        this.beatNode.disconnect();
        this.beatNode = null;
        this.generator.disconnect();
        this.generator = null;
        super.destroy();
    }
}

export default SubOscillator;
