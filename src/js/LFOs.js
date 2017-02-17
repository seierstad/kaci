import LFO from "./LFO";

class LFOs {

    constructor (context, store, configuration, dc) {

        this.context = context;
        this.store = store;
        this.state = store.getState();

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.lfos = this.setupLFOs(configuration.source.lfo, this.state.patch.lfos, dc);
    }

    stateChangeHandler () {
        const newState = this.store.getState();

        // TODO:
        // handle change from local to global/retrigger lfo mode
        // and handle global lfo start/retrigger/stop on keypress/release

        this.state = newState;
    }

    setupLFOs (configuration, patch, dc) {
        let i, j;
        const result = [];

        for (i = 0, j = configuration.count; i < j; i += 1) {
            const p = patch[i] || configuration.default;
            if (p.mode === "global" || p.mode === "retrigger") {
                result[i] = new LFO(this.context, this.store, p, dc, i);
            }
        }

        return result;
    }

    start () {
        this.lfos.forEach(lfo => lfo.start());
    }

    stop () {
        this.lfos.forEach(lfo => lfo.stop());
    }

}


export default LFOs;
