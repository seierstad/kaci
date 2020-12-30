import PeriodicModulator from "./periodic-modulator";

class DiscretePeriodicModulator extends PeriodicModulator {

    constructor (...args) {
        super(...args);

        const [, , patch] = args;
        const {
            speed: {
                speedUnit
            } = {}
        } = patch;

        this.speedUnit = speedUnit;
    }


    set speedUnit (speedUnit) {
        this.speedState.speedUnit = speedUnit;
        if (this.oscillator) {
            this.oscillator.speedUnit = speedUnit;
        }
    }

    get speedUnit () {
        return this.speedState.speedUnit;
    }

    updateState (newState) {
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (this.speedUnit !== newState.speed.speedUnit) {
            this.speedUnit = newState.speed.speedUnit;
        }
    }

    init () {
        this.oscillator.speedUnit = this.speedUnit;
    }

    disconnect () {
        if (typeof super.disconnect === "function") {
            super.disconnect();
        }
    }

    destroy () {
        delete this.speedState.speedUnit;

        if (typeof super.destroy === "function") {
            super.destroy();
        }
    }
}

export default DiscretePeriodicModulator;
