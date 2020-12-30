import autobind from "autobind-decorator";

import {MODULATOR_MODE} from "../modulator/constants";

import MorseGenerator from "./morse-generator";
import configuration from "./configuration";


class MorseGenerators {

    constructor (context, store) {
        this.context = context;
        this.store = store;
        this.state = store.getState();

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);
        this.generators = this.setupGenerators(this.state.patch.morse);
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger morseGenerator mode

        this.state = newState;
    }

    setupGenerators (patch) {
        let i, j;
        const result = [];

        for (i = 0, j = configuration.count; i < j; i += 1) {
            const p = patch[i] || configuration.default;

            if (p.mode === MODULATOR_MODE.GLOBAL || p.mode === MODULATOR_MODE.RETRIGGER) {
                result[i] = new MorseGenerator(this.context, this.store, p, i);
            }
        }

        return result;
    }

    init () {
        return Promise.all(this.generators.map(generator => generator.init()));
    }

    reset () {
        this.generators.forEach(morseGenerator => morseGenerator.reset());
    }

    start () {
        this.generators.forEach(morseGenerator => morseGenerator.start());
    }

    stop () {
        this.generators.forEach(morseGenerator => morseGenerator.stop());
    }

}


export default MorseGenerators;
