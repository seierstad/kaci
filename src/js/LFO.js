import autobind from "autobind-decorator";
// import WavyJones from "../../lib/wavy-jones";
import Modulator from "./decorators/modulator";
import IdealOscillator from "./IdealOscillator";
import SyncSource from "./decorators/sync-source";
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
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new IdealOscillator(this.context, this.dc);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        this.parameters = {...this.oscillator.targets};

        this.waveform = this.state.waveform;
    }


    set waveform (waveformName) {
        this.oscillator.waveform = waveformName;
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState().patch.lfos[this.index];

        if (newState && (newState !== this.state)) {
            super.updateState(newState);

            if (this.state.waveform !== newState.waveform) {
                this.waveform = newState.waveform;
            }

            this.state = newState;
        }
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

export default SyncSource(LFO);
