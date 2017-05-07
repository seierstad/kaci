import MorseGenerator from "./morse-generator";

class MorseGenerators {

    constructor (context, store, configuration, dc) {

        this.context = context;
        this.store = store;
        this.state = store.getState();

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.generators = this.setupGenerators(configuration.source.morse, this.state.patch.morse, dc);
    }

    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger morseGenerator mode

        this.state = newState;
    }

    setupGenerators (configuration, patch, dc) {
        let i, j;
        const result = [];

        for (i = 0, j = configuration.count; i < j; i += 1) {
            const p = patch[i] || configuration.default;
            if (p.mode === "global" || p.mode === "retrigger") {
                result[i] = new MorseGenerator(this.context, this.store, p, dc, i);
            }
        }

        return result;
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
