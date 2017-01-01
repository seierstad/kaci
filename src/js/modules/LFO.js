import DCGenerator from "./DCGenerator";
import IdealOscillator from "./IdealOscillator";


class LFO {
    constructor(context, store, index, isSyncMaster) {

        this.context = context;
        this.index = index;
        this.store = store;
        this.state = store.getState().patch.lfos[this.index];
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.updateOutputRanges = this.updateOutputRanges.bind(this);
        this.isSyncMaster = isSyncMaster;
        if (this.state && this.state.sync && typeof this.state.sync.master === "number") {
            this.syncMasterState = store.getState().patch.lfos[this.state.sync.master];
        }

        this.postGain = context.createGain(); // set gain.value to 0 to mute the lfo output
        this.oscillator = new IdealOscillator(context);
        this.outputs = {};

        this.oscillator.connect(this.postGain);

        this.frequency = this.oscillator.frequency;
        this.frequency.value = 0;

        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency.setValueAtTime(this.state.frequency, this.context.currentTime);
        }

        this.detune = this.oscillator.detune;
        this.setWaveform(this.state.waveform);

        this.addOutput("positive", [0, 0.5, 1]);
        this.addOutput("negative", [-1, -0.5, 0]);
        this.setValueAtTime(this.state.amount, context.currentTime);

        /*
        if (patch.syncEnabled && patch.syncRatioNumerator && patch.syncRatioDenominator) {
            this.syncToMaster();
        } else {
            if (typeof patch.frequency === "number") {
                this.setFrequency(patch.frequency);
            }
        }
*/

    }
    stateChangeHandler () {
        const newState = this.store.getState().patch.lfos[this.index];
        if (newState !== this.state) {
            if (this.state.amount !== newState.amount) {
                this.setValueAtTime(newState.amount, this.context.currentTime);
            }
            if (this.state.waveform !== newState.waveform) {
                this.setWaveform(newState.waveform);
            }
            if (this.state.frequency !== newState.frequency) {
                if (!newState.sync || !newState.sync.enabled) {
                    this.setFrequency(newState.frequency);
                }
            }
            if (this.state.sync !== newState.sync) {
                if (this.state.sync && this.state.sync.enabled && !newState.sync.enabled) {
                    // sync disabled
                    this.setFrequency(newState.frequency);
                }
                if ((!this.state.sync || this.state.sync && !this.state.sync.enabled) && newState.sync.enabled) {
                    // sync enabled
                    this.syncMasterState = store.getState().patch.lfos[newState.sync.master];
                }
                if (this.state.sync && this.state.sync.enabled) {
                    if (this.state.sync.numerator !== newState.sync.numerator) {

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
    setFrequency (frequency) {
        this.frequency.setValueAtTime(frequency, this.context.currentTime);
    }
    syncToMaster () {
        var that = this;

        const masterZeroPhaseHandler = (event) => {
            masterFrequencyHandler(event);
            that.oscillator.resetPhase();
            that.context.removeEventListener('lfo.master.zeroPhase', masterZeroPhaseHandler);
        }
        const masterFrequencyHandler = (event) => {
            var syncedFrequency;

            if (!isNaN(event.detail)) {
                if (that.sync.enabled) {
                    syncedFrequency = event.detail * that.sync.ratio.denominator / that.sync.ratio.numerator;
                    that.setFrequency(syncedFrequency);
                }
            }
            that.context.removeEventListener('lfo.master.frequency', masterFrequencyHandler);
        };

    }
    updateOutputRanges(amount) {
        if (this.outputs.positive) {
            this.outputs.positive.curve = new Float32Array([0, amount]);
        }
        if (this.outputs.negative) {
            this.outputs.negative.curve = new Float32Array([-amount, 0]);
        }
    };

    setValueAtTime(value, time) {
        var delay = 0;

        this.postGain.gain.setValueAtTime(value, time);

        if (time) {
            delay = Math.max(time - this.context.currentTime, 0);
        }
        setTimeout(this.updateOutputRanges(value), delay);
    }
    setWaveform(waveformName) {
        this.oscillator.setWaveform(waveformName);
    }
    start(time) {
        this.oscillator.start(time);
    }
    stop() {
        this.oscillator.stop();
    }
    destroy() {
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
    disconnect() {
        this.postGain.disconnect();
    }
    connect(node) {
        if (node.hasOwnProperty('input')) {
            this.postGain.connect(node.input);
        } else {
            this.postGain.connect(node);
        }
    }
    addOutput(name, range) {
        var shaper,
            out;

        if (this.outputs[name]) {
            throw {
                "error": "An output named '" + name + "' already exists"
            };
        }
        shaper = this.context.createWaveShaper();

        if (range && range.length === 2) {
            shaper.curve = new Float32Array(range);
        }

        this.oscillator.connect(shaper);
        this.outputs[name] = shaper;
    }
}


export default LFO;
