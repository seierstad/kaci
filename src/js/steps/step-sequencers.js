import autobind from "autobind-decorator";
import {MODULATOR_MODE} from "../modulator/constants";
import StepSequencer from "./step-sequencer";
import configuration from "./configuration";


class StepSequencers {

    constructor (context, store) {
        this.context = context;
        this.store = store;
        this.state = store.getState();

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);
        this.sequencers = this.setupSequencers(this.state.patch.steps);
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger step mode

        this.state = newState;
    }

    setupSequencers (patch = {}) {
        const result = [];
        const j = configuration.count;

        for (let i = 0; i < j; i += 1) {
            const p = patch[i] || configuration.default;

            if (p.mode === MODULATOR_MODE.GLOBAL || p.mode === MODULATOR_MODE.RETRIGGER) {
                result[i] = new StepSequencer(this.context, this.store, p, i);
            }
        }

        return result;
    }

    init () {
        return Promise.all(this.sequencers.map(sequencer => sequencer.init()));
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
