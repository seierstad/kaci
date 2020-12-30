import Modulator from "../modulator/modulator";
/*
    handles common functions for periodic modulators:
    - frequency
    - sync

    subclass requirements:
        properties:
            - this.oscillator with functions: start(time), stop(), resetPhase()


        functions:


 */

class PeriodicModulator extends Modulator {

    constructor (...args) {
        super(...args);

        const [, , patch] = args;
        const {
            speed: {
                frequency,
                sync
            } = {}
        } = patch;
        this.speedState = {
            ...patch.speed
        };
        this.speedState.frequency = frequency;
        this.speedState.sync = sync;
    }


    set frequency (frequency) {
        this.speedState.frequency = frequency;
        this.oscillator.frequency = frequency;
    }

    set sync (sync) {
        this.speedState.sync = sync;
        this.oscillator.sync = sync;
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

    updateState (newState) {
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (this.speedState.frequency !== newState.speed.frequency) {
            this.frequency = newState.speed.frequency;
        }

        if (this.speedState.sync !== newState.speed.sync) {
            this.sync = newState.speed.sync;
        }
    }


    disconnect () {
        this.oscillator.disconnect();

        if (typeof super.disconnect === "function") {
            super.disconnect();
        }
    }

    destroy () {
        this.speedState = null;
        delete this.speedState;
        this.oscillator.destroy();
        this.oscillator = null;

        if (typeof super.destroy === "function") {
            super.destroy();
        }
    }
}

export default PeriodicModulator;
