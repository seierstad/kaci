import {inputNode} from "./shared-functions";


import OutputStage from "./output-stage";

class SubOscillator {

    static inputDefs = [
        {
            "name": "detune"
        }, {
            "name": "beat"
        }
    ];

    static gains = [
        "frequency",
        "detuneMultiplier",
        "detune",
        "beat",
        "ratio"
    ];

    constructor (context, dc, patch, frequency, scaleBaseNumber = 2) {

        /* start common constructor code */

        this.context = context;
        this.state = {
            ...patch,
            beat_sync: {
                ...patch.beat_sync
            }
        };

        // gain, pan and mute
        this.outputStage = new OutputStage(context, dc, !!patch.active);

        this.parameters = {...this.outputStage.targets};


        this.constructor.inputDefs.forEach((def) => {
            this.parameters[def.name] = inputNode(context);
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
        dc.connect(this.frequencyNode);
        dc.connect(this.beatNode);
        dc.connect(this.detuneNode);

        this.detuneNode.connect(this.detuneMultiplierNode);
        // multiply semitones by 100 to get cents
        this.detuneMultiplierNode.gain.setValueAtTime(100, context.currentTime);
        this.detuneMultiplierNode.connect(this.generator.detune);

        this.frequencyNode.connect(this.ratioNode);
        this.beatNode.connect(this.ratioNode);
        this.ratioNode.connect(this.generator.frequency);
        this.generator.connect(this.outputStage.input);


        this.frequency = frequency;
        this.scaleBaseNumber = scaleBaseNumber;
        this.depth = patch.depth;
        this.mode = patch.mode;
        this.active = patch.active;
    }

    get targets () {
        return this.parameters;
    }

    set active (active) {
        this.outputStage.active = active;
    }

    set frequency (frequency) {
        this.frequencyNode.gain.setValueAtTime(frequency, this.context.currentTime);
    }

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

    start () {
        this.generator.start();
    }

    stop () {
        this.generator.stop();
    }

    connect (node) {
        this.outputStage.connect(node);
    }

    disconnect () {
        this.outputStage.disconnect();
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
        this.outputStage.destroy();
        this.outputStage = null;
    }
}

export default SubOscillator;
