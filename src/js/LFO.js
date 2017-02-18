// import WavyJones from "../../lib/wavy-jones";
import IdealOscillator from "./IdealOscillator";

/**
    LFO: three outputs
        - LFO.output (connected by LFO.connect(...)): full range (-1 to 1)
        - LFO.outputs.positive (connected by LFO.)

*/

class LFO {

    constructor (context, store, patch, dc, index, isSyncMaster) {

        this.context = context;
        this.index = index;
        this.store = store;
        this.state = {...patch};
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.updateOutputRanges = this.updateOutputRanges.bind(this);

        this.isSyncMaster = isSyncMaster;
        if (this.state && this.state.sync && typeof this.state.sync.master === "number") {
            this.syncMasterState = store.getState().patch.lfos[this.state.sync.master];
            this.syncRatio = context.createGain();
        }

        this.postGain = context.createGain(); // set gain.value to 0 to mute the lfo output
        this.oscillator = new IdealOscillator(context, dc);
        this.outputs = {};

        this.oscillator.connect(this.postGain);

        this.parameters = {...this.oscillator.targets};

        this.addOutput("positive", [0, 0.5, 1]);
        this.addOutput("negative", [-1, -0.5, 0]);


        /*
        if (patch.syncEnabled && patch.syncRatioNumerator && patch.syncRatioDenominator) {
            this.syncToMaster();
        }
        */

        this.active = this.state.active;
        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
        }

        this.amount = this.state.amount;
        this.waveform = this.state.waveform;
    }

    set active (active) {
        this.postGain.gain.setValueAtTime((active ? 1 : 0), this.context.currentTime);
    }

    set frequency (frequency) {
        this.oscillator.frequency = frequency;
    }

    set amount (...params) {
        const [value, time = this.context.currentTime] = params;
        let delay = 0;

        this.postGain.gain.setValueAtTime(value, time);

        if (time) {
            delay = Math.max(time - this.context.currentTime, 0);
        }
        setTimeout(this.updateOutputRanges(value), delay);
    }

    set waveform (waveformName) {
        this.oscillator.waveform = waveformName;
    }

    set sync ({numerator, denominator}) {
        this.syncRatio.gain.setValueAtTime(numerator / denominator, this.context.currentTime);
    }

    stateChangeHandler () {

        const newState = this.store.getState().patch.lfos[this.index];

        if (newState && (newState !== this.state)) {
            if (this.state.amount !== newState.amount) {
                this.amount = newState.amount;
            }
            if (this.state.waveform !== newState.waveform) {
                this.waveform = newState.waveform;
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
            this.state = newState;
        }
    }

    /*
"lfo.change.sync.ratio",
"lfo.change.sync.enable",
"lfo.change.sync.disable",
"lfo.reset",
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
            that.oscillator.resetPhase();
            that.context.removeEventListener("lfo.master.zeroPhase", masterZeroPhaseHandler);
        };
    }

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

        this.oscillator.connect(shaper);
        this.outputs[name] = shaper;
    }

    start (time) {
        this.oscillator.start(time);
    }

    stop () {
        this.oscillator.stop();
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
        this.unsubscribe();

        this.context = null;
        this.index = null;
        this.store = null;
        this.state = null;
        this.stateChangeHandler = null;
        this.unsubscribe = null;
        this.postGain.disconnect();
        this.postGain = null;
        this.oscillator.destroy();
        this.oscillator = null;
    }
}


export default LFO;
