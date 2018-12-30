import autobind from "autobind-decorator";
// import WavyJones from "../../lib/wavy-jones";
import Modulator from "../modulator/modulator";
import Oscillator from "../oscillator/ideal-oscillator";
import OscillatorWorkletNode from "../oscillator/oscillator-worklet-node";

/* eslint-disable */
import worklet from "../oscillator/oscillator.worklet.js";
/* eslint-enable */

/**
    LFO: three outputs
        - LFO.output (connected by LFO.connect(...)): full range (-1 to 1)
        - LFO.outputs.positive (connected by LFO.)

*/

class LFO extends Modulator {

    constructor (...args) {
        super(...args);
        const [context, store, patch, index] = args;

        this.stateSelector = ["patch", "lfos", index];
        this.changeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.changeHandler);

        this.parameters = null;

        this.isWorklet = true;

        if (!this.context.audioWorklet) {
            this.isWorklet = false;
            this.oscillator = new Oscillator(this.context);
            this.oscillator.connect(this.postGain);
            this.parameters = {...this.oscillator.parameters};
            this.frequency = this.state.frequency;
            this.waveform = this.state.waveform;


            for (let name in this.outputs) {
                this.oscillator.connect(this.outputs[name]);
            }
        }
    }

    init () {

        const that = this;
        if (this.isWorklet) {
            return this.context.audioWorklet.addModule(worklet).then(() => {
                this.oscillator = new OscillatorWorkletNode(this.context);
                this.oscillator.connect(this.postGain);
                for (let name in this.outputs) {
                    this.oscillator.connect(that.outputs[name]);
                }
                this.waveform = this.state.waveform;
                this.frequency = this.state.frequency;
                return that;
            });
        }


        return new Promise((resolve) => {
            resolve(this);
        });
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

//export default SyncTarget(SyncSource(LFO));
export default LFO;
