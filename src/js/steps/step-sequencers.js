import autobind from "autobind-decorator";
import KaciNode from "../kaci-node";
import {MODULATOR_MODE} from "../modulator/constants";
import StepSequencer from "./step-sequencer";


class StepSequencers extends KaciNode {

    constructor (...args) {
        super(...args);
        const [, store, configuration] = args;

        this.store = store;
        this.state = store.getState();
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.sequencers = this.setupSequencers(configuration.source.steps, this.state.patch.steps);
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger step mode

        this.state = newState;
    }

    setupSequencers (configuration, patch = {}) {
        const result = [];
        const j = configuration.count;

        for (let i = 0; i < j; i += 1) {
            const {
                [i]: p = configuration.default
            } = patch;

            if (p.mode === MODULATOR_MODE.GLOBAL || p.mode === MODULATOR_MODE.RETRIGGER) {
                result[i] = new StepSequencer(this.context, this.store, p, i);
            }
        }

        return result;
    }

    reset () {
        this.sequencers.forEach(sequencer => sequencer.reset());
    }

    start () {
        this.sequencers.forEach(sequencer => sequencer.start());
    }

    stop () {
        this.sequencers.forEach(sequencer => sequencer.stop());
    }

}


export default StepSequencers;
