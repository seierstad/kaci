import autobind from "autobind-decorator";

import KaciNode from "../kaci-node";

/*
    handles common functions for modulators:
    - amount
    - active
    - multiple outputs (positive/negative/full)

    subclass requirements:
        properties:
            - this.oscillator with functions: start(time), stop(), resetPhase()


        functions:


 */

class Modulator extends KaciNode {

    constructor (...args) {
        super(...args);

        const [, , , index] = args;
        this.index = index;

        this.postGain = this.context.createGain(); // set gain.value to 0 to mute the lfo output

        this.outputs = {};
        this.addOutput("positive", [0, 0.5, 1]);
        this.addOutput("negative", [-1, -0.5, 0]);

        this.amount = this.state.amount;
        this.active = this.state.active;
    }


    set active (active) {
        this.postGain.gain.setValueAtTime((active ? 1 : 0), this.context.currentTime);
    }

    set amount (value) {
        this.postGain.gain.setValueAtTime(value, this.context.currentTime);
        setTimeout(this.updateOutputRanges(value), 1);
    }

    /*
    "lfo.change.sync.ratio",
    "lfo.change.sync.enable",
    "lfo.change.sync.disable",
    "lfo.master.requestZeroPhase",
    "lfo.master.requestFrequency",
    "lfo.master.changed.frequency",
    "lfo.master.reset",
    'lfo.master.zeroPhase'
    */

    @autobind
    updateOutputRanges (amount) {
        if (this.outputs.positive) {
            this.outputs.positive.curve = new Float32Array([0, amount]);
        }
        if (this.outputs.negative) {
            this.outputs.negative.curve = new Float32Array([-amount, 0]);
        }
    }

    updateState (newState) {
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (this.state.amount !== newState.amount) {
            this.amount = newState.amount;
        }
    }

    addOutput (name, range) {
        if (this.outputs[name]) {
            throw new Error ("An output named '" + name + "' already exists");
        }

        const shaper = this.context.createWaveShaper();

        if (range && range.length >= 2) {
            shaper.curve = Float32Array.of(...range);
        }

        this.outputs[name] = shaper;
    }

    connect (node) {
        if (Object.prototype.hasOwnProperty.call(node, "input")) {
            this.postGain.connect(node.input);
        } else {
            this.postGain.connect(node);
        }
    }

    disconnect () {
        this.postGain.disconnect();
    }

    destroy () {
        this.index = null;
        this.oscillator.disconnect();
        this.oscillator.destroy();
        this.oscillator = null;

        for (let name in this.outputs) {
            this.outputs[name].disconnect();
        }

        this.postGain.disconnect();
        this.postGain = null;
    }
}

export default Modulator;
