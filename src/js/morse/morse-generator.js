import Sequencer from "../sequencer/sequencer";
import {getSequence} from "./functions";


class MorseGenerator extends Sequencer {

    constructor (...args) {
        super(...args);
        const [, , , index] = args;

        this.stateSelector = ["patch", "morse", index];
        this.changeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.changeHandler);
    }

    set sequence (patch) {
        if (this.oscillator) {
            this.oscillator.sequence = getSequence(patch).map(
                (s, index, arr) => {
                    const prev = (index === 0) ? arr[arr.length - 1] : arr[index - 1];
                    if (
                        (this.glide.up.active && s && !prev)
                        || (this.glide.down.active && !s && prev)
                    ) {
                        return [(s ? 1 : 0), true];
                    }
                    return [(s ? 1 : 0), false];
                }
            );
        }
    }

    updateState (newState) {
        const sequenceChanged = (
            this.state.text !== newState.text
            || this.glide !== newState.glide
            || this.state.shift !== newState.shift
            || this.state.padding !== newState.padding
            || this.state.fillToFit !== newState.fillToFit
        );

        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        if (sequenceChanged) {
            this.sequence = newState;
        }

        this.state = newState;
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


export default MorseGenerator;
