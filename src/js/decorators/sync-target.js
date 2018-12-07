import autobind from "autobind-decorator";

/*
    handles common sync functions:
    - frequency
    - ratio (nominator / denominator)

    intended to be used by:
    - lfo
    - morse
    - step
    - sub beat
 */

const SyncTarget = Sup => class SyncTarget extends Sup {

    constructor (...args) {
        super(...args);
        const [context, store, patch = {}, index] = args;
        const {sync} = patch;

        this.syncInput = {
            frequency: this.context.createGain(),
            phase: this.context.createGain()
        };

        if (sync) {
            this.sync = sync;
            this.syncEnabled = sync.enabled;
        }
        this.state = {...patch};
    }

    set sync ({numerator, denominator}) {
        console.log("synck!");
        this.syncInput.frequency.gain.setValueAtTime(numerator / denominator, this.context.currentTime);
    }

    set syncEnabled (enabled) {
        if (enabled) {
            this.parameters.frequency.disconnect(this.mergedInput);
            this.syncInput.frequency.connect(this.oscillator.mergedInput, 0);
        } else {
            this.syncInput.frequency.disconnect(this.mergedInput);
            this.parameters.frequency.connect(this.oscillator.mergedInput, 0);
        }
    }

    /*
    "lfo.change.sync.ratio",
    "lfo.change.sync.enable",
    "lfo.change.sync.disable",
    "lfo.master.requestZeroPhase",
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
        if (this.state.sync !== newState.sync) {
            if (this.state.sync.enabled !== newState.sync.enabled) {
                this.syncEnabled = !!newState.sync.enabled;
            }
            if (this.state.sync.numerator !== newState.sync.numerator || this.state.sync.denominator !== newState.sync.denominator) {
                const {numerator, denominator} = newState.sync;
                this.sync = {numerator, denominator};
            }
            this.sync = newState.sync;
        }

        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }
    }

    destroy () {
        if (this.syncInput) {
            if (this.syncInput.frequency) {
                this.syncInput.frequency.disconnect();
                this.syncInput.frequency = null;
            }
            if (this.syncInput.phase) {
                this.syncInput.phase.disconnect();
                this.syncInput.phase = null;
            }
        }
        super.destroy();
    }
};

export default SyncTarget;
