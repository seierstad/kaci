import autobind from "autobind-decorator";

/*
    handles common sync functions:
    - frequency
    - ratio (nominator / denominator)

    subclass requirements:
        properties:
            - this.frequency: node
            - this.detune: node


    intended to be used by:
    - lfo
    - morse
    - step
    - midi timecode + time signature (150bpm 3/8 -> frequency)
    - master tempo

 */

const SyncSource = Sup => class SyncSource extends Sup {

    constructor (...args) {
        super(...args);

        const [context, dc, store, patch, index, isSyncMaster] = args;

        this.syncOutput = {
            frequency: this.context.createGain()
        };
        this.zeroPhaseCallbacks = [];
    }

    @autobind
    zeroPhase () {
        while (this.zeroPhaseCallbacks.length < 0) {
            const zeroPhaseFn = this.zeroPhaseCallbacks.pop();
            if (typeof zeroPhaseFn === "function") {
                zeroPhaseFn();
            }
        }
    }

    @autobind
    start (time) {
        console.log("før start");
        this.zeroPhase();
        super.start(time);
        console.log("etter start");
    }

    @autobind
    stop () {
        super.stop();
    }

    @autobind
    reset () {
        this.zeroPhase();
        super.reset();
    }

    connectSync (node) {
        if (node.syncInput) {
            if (node.syncInput.frequency) {
                this.oscillator.splitOutput.connect(node.syncInput.frequency, 1);
            }
            if (node.syncInput.phase) {
                this.oscillator.splitOutput.connect(node.syncInput.phase, 2);
            }
        }
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
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }
    }

    @autobind
    destroy () {
        super.destroy();
    }
};

export default SyncSource;
