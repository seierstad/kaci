import autobind from "autobind-decorator";
import KaciNode from "../kaci-node";
import configuration from "./configuration";
import LFO from "./lfo";


class LFOs extends KaciNode {

    constructor (...args) {
        super(...args);
        const [, store] = args;
        this.store = store;
        this.state = store.getState();
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);
        console.log(configuration);

        this.lfos = this.setupLFOs(configuration, this.state.patch.lfos);
    }

    init () {
        return Promise.all(this.lfos.map(lfo => lfo.init()));
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        // handle change from local to global/retrigger lfo mode

        this.state = newState;
    }

    setupLFOs (configuration, patch) {
        const result = [];
        const j = configuration.count;

        for (let i = 0; i < j; i += 1) {
            const p = patch[i] || configuration.default;
            if (p.mode === "global" || p.mode === "retrigger") {
                result[i] = new LFO(this.context, this.store, p, i);
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
