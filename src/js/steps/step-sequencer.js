import Sequencer from "../sequencer/sequencer";


class StepSequencer extends Sequencer {


    constructor (...args) {
        super(...args);
        const [, , , index] = args;

        this.stateSelector = ["patch", "steps", index];
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

    }

    set sequence (patch) {
        if (this.oscillator) {
            this.oscillator.sequence = patch.sequence.map(step => [step.value, !!step.glide]);
        }
        this.state.sequence = patch.sequence;
    }

    updateState (newState) {
        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (newState.sequence !== this.state.sequence) {
            this.sequence = newState;
        }
    }

    destroy () {
        if (typeof super.destroy === "function") {
            super.destroy();
        }
        this.unsubscribe();

        this.stateChangeHandler = null;
        this.unsubscribe = null;
    }
}

export default StepSequencer;
