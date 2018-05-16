import autobind from "autobind-decorator";
// import WavyJones from "../../lib/wavy-jones";
import Modulator from "./decorators/modulator";
import IdealOscillator from "./IdealOscillator";
import SyncSource from "./decorators/sync-source";
import SyncTarget from "./decorators/sync-target";
import KaciNode from "./kaci-node";
/**
    LFO: three outputs
        - LFO.output (connected by LFO.connect(...)): full range (-1 to 1)
        - LFO.outputs.positive (connected by LFO.)

*/

class LFO extends Modulator {

    constructor (...args) {
        super(...args);
        const [context, dc, store, patch, index] = args;

        this.stateSelector = ["patch", "lfos", index];
        this.changeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.changeHandler);

        this.oscillator = new IdealOscillator(this.context, this.dc);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        this.parameters = {...this.oscillator.parameters};

        this.frequency = this.state.frequency;
        this.waveform = this.state.waveform;
    }


    set waveform (waveformName) {
        this.oscillator.waveform = waveformName;
    }

    updateState (newState) {
        if (this.state.waveform !== newState.waveform) {
            this.waveform = newState.waveform;
        }

        if (typeof super.updateState === "function") {
            super.updateState(newState);
        }

        this.state = newState;
    }

    destroy () {
        super.destroy();
        this.unsubscribe();

        this.stateChangeHandler = null;
        this.unsubscribe = null;
    }
}


export {
    LFO
};

export default SyncTarget(SyncSource(LFO));
