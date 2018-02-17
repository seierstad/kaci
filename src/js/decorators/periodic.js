import autobind from "autobind-decorator";

/*
    handles common functions for periodic modulators:
    - frequency
    - sync
    - amount
    - active
    - multiple outputs (positive/negative/full)

    subclass requirements:
        properties:
            - this.oscillator with functions: start(time), stop(), resetPhase()


        functions:


 */

class Periodic {

    constructor (...args) {

        const [context, store, patch, dc, index, isSyncMaster] = args;

        this.context = context;
        this.index = index;
        this.store = store;
        this.state = {...patch};

        this.postGain = context.createGain(); // set gain.value to 0 to mute the lfo output

        this.outputs = {};
        this.addOutput("positive", [0, 0.5, 1]);
        this.addOutput("negative", [-1, -0.5, 0]);

        this.isSyncMaster = isSyncMaster;

        /*
        if (patch.syncEnabled && patch.syncRatioNumerator && patch.syncRatioDenominator) {
            this.syncToMaster();
        }
        */

        /*
        this.isSyncMaster = isSyncMaster;
        if (this.state && this.state.sync && typeof this.state.sync.master === "number") {
            this.syncMasterState = store.getState().patch.lfos[this.state.sync.master];
            this.syncRatio = context.createGain();
        }
        */
        /*
        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
        }
        */

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

    set sync ({numerator, denominator}) {
        this.syncRatio.gain.setValueAtTime(numerator / denominator, this.context.currentTime);
    }

    set frequency (frequency) {
        this.oscillator.frequency = frequency;
    }

    start (time) {
        this.oscillator.start(time);
    }

    stop () {
        this.oscillator.stop();
    }

    reset () {
        this.oscillator.resetPhase();
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


    syncToMaster () {
        let that = this;

        const masterFrequencyHandler = (event) => {
            let syncedFrequency;

            if (!isNaN(event.detail)) {
                if (that.sync.enabled) {
                    syncedFrequency = event.detail * that.sync.ratio.denominator / that.sync.ratio.numerator;
                    that.setFrequency(syncedFrequency);
                }
            }
            that.context.removeEventListener("lfo.master.frequency", masterFrequencyHandler);
        };
        const masterZeroPhaseHandler = (event) => {
            masterFrequencyHandler(event);
            that.reset();
            that.context.removeEventListener("lfo.master.zeroPhase", masterZeroPhaseHandler);
        };
    }

    updateState (newState) {
        if (this.state.amount !== newState.amount) {
            this.amount = newState.amount;
        }
        if (this.state.frequency !== newState.frequency) {
            if (!newState.sync || !newState.sync.enabled) {
                this.frequency = newState.frequency;
            }
        }
        if (this.state.sync !== newState.sync) {
            if (this.state.sync && this.state.sync.enabled && !newState.sync.enabled) {
                // sync disabled
                this.frequency = newState.frequency;
            }
            if ((!this.state.sync || this.state.sync && !this.state.sync.enabled) && newState.sync.enabled) {
                // sync enabled
                this.syncMasterState = this.store.getState().patch.lfos[newState.sync.master];
            }
            if (this.state.sync && this.state.sync.enabled) {
                if (this.state.sync.numerator !== newState.sync.numerator || this.state.sync.denominator !== newState.sync.denominator) {
                    const {numerator, denominator} = newState.sync;
                    this.sync = {numerator, denominator};
                }
            }
        }
    }

    @autobind
    updateOutputRanges (amount) {
        if (this.outputs.positive) {
            this.outputs.positive.curve = new Float32Array([0, amount]);
        }
        if (this.outputs.negative) {
            this.outputs.negative.curve = new Float32Array([-amount, 0]);
        }
    }

    addOutput (name, range) {
        if (this.outputs[name]) {
            throw new Error ("An output named '" + name + "' already exists");
        }

        const shaper = this.context.createWaveShaper();

        if (range && range.length === 2) {
            shaper.curve = new Float32Array(range);
        }

        this.outputs[name] = shaper;
    }

    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.postGain.connect(node.input);
        } else {
            this.postGain.connect(node);
        }
    }

    disconnect () {
        this.postGain.disconnect();
    }

    destroy () {
        this.context = null;
        this.index = null;
        this.store = null;
        this.state = null;

        for (let name in this.outputs) {
            this.outputs[name].disconnect();
        }

        this.postGain.disconnect();
        this.postGain = null;
        this.oscillator.destroy();
        this.oscillator = null;
    }
}

export default Periodic;
