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
        const [context, dc, store, patch, index] = args;
        this.syncInput = {
            frequency: this.context.createGain()
        };

        this.sync = patch.sync;
        this.state = {...patch};
    }

    set sync ({numerator, denominator}) {
        this.syncInput.frequency.gain.setValueAtTime(numerator / denominator, this.context.currentTime);
    }

    connectSync (syncSource) {
        syncSource.syncOutput.frequency.connect(this.syncInput.frequency);
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
        if (typeof super.updateState === "function") {
            super.updateState(newState);
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

    destroy () {
        if (this.syncInput) {
            if (this.syncInput.frequency) {
                this.syncInput.frequency.disconnect();
                this.syncInput.frequency = null;
            }
        }
        super.destroy();
    }
};

export default SyncTarget;
