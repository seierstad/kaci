import DiscretePeriodicModulator from "../periodic/discrete-periodic-modulator";
import SequencerWorkletNode from "./sequencer-worklet-node";

/* eslint-disable */
import worklet from "./sequencer.worklet.js";
/* eslint-enable */

class Sequencer extends DiscretePeriodicModulator {

    constructor (...args) {
        super(...args);
        const [, , patch] = args;
        const {glide} = patch;

        this.parameters = null;
        this.glideState = null;
        this.glide = glide;

        if (!this.context.audioWorklet) {
            console.log("sequencers depend on audioWorklet support");
        }
    }

    set glide (glide) {
        this.glideState = glide;
        if (this.oscillator) {
            this.oscillator.glide = glide;
        }
    }

    get glide () {
        return this.glideState;
    }

    set maxValue (value) {
        if (this.oscillator) {
            this.oscillator.maxValue = value;
        }
        this.state.maxValue = value;
    }

    updateState (newState) {
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (this.glide !== newState.glide) {
            this.glide = newState.glide;
        }

        if (this.state.maxValue !== newState.maxValue) {
            this.maxValue = newState.maxValue;
        }
    }

    init () {
        const that = this;
        return this.context.audioWorklet.addModule(worklet).then(() => {
            that.oscillator = new SequencerWorkletNode(that.context);

            // temporary constant value (awaiting sync connection matrix)
            that.syncFreq = this.context.createConstantSource();
            that.syncFreq.offset.setValueAtTime(1, that.context.currentTime);
            that.syncFreq.connect(that.oscillator).connect(that.postGain);
            that.syncFreq.start();
            //

            for (let name in that.outputs) {
                that.oscillator.connect(that.outputs[name]);
            }
            that.glide = that.glideState;
            that.sequence = that.state;
            that.frequency = that.state.speed.frequency;
            that.sync = that.state.speed.sync;
            that.maxValue = that.state.maxValue;
            if (typeof super.init === "function") {
                super.init();
            }

            return that;
        });
    }

    destroy () {
        this.glideState = null;
        if (typeof super.destroy === "function") {
            super.destroy();
        }
    }
}


export default Sequencer;
