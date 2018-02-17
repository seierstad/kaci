import autobind from "autobind-decorator";
// import WavyJones from "../../lib/wavy-jones";
import Periodic from "./decorators/periodic";
import IdealOscillator from "./IdealOscillator";

/**
    LFO: three outputs
        - LFO.output (connected by LFO.connect(...)): full range (-1 to 1)
        - LFO.outputs.positive (connected by LFO.)

*/

class LFO extends Periodic {

    constructor (context, store, patch, dc, index, isSyncMaster) {
        super(context, store, patch, dc, index, isSyncMaster);

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.oscillator = new IdealOscillator(context, dc);
        this.oscillator.connect(this.postGain);

        for (let name in this.outputs) {
            this.oscillator.connect(this.outputs[name]);
        }

        if (!this.state.sync || !this.state.sync.enabled) {
            this.frequency = this.state.frequency;
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


export default LFO;
