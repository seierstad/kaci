import LFO from "./LFO";

class LFOs {

    constructor (context, store, configuration, dc) {

        this.context = context;
        this.store = store;
        this.state = store.getState();
        console.log("neio");
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.lfos = this.setupLFOs(configuration.source.lfo, this.state.patch.lfos, dc);
    }

    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger lfo mode

        this.state = newState;
    }

    setupLFOs (configuration, patch, dc) {
        const result = [];
        const j = configuration.count;

        for (let i = 0; i < j; i += 1) {
            const p = patch[i] || configuration.default;
            if (p.mode === "global" || p.mode === "retrigger") {
                result[i] = new LFO(this.context, this.store, p, dc, i);
            }
        }

        return result;
    }

    reset () {
        this.lfos.forEach(lfo => lfo.reset());
    }

    start () {
        this.lfos.forEach(lfo => lfo.start());
    }

    stop () {
        this.lfos.forEach(lfo => lfo.stop());
    }

}


export default LFOs;
