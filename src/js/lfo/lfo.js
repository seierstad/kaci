import PeriodicModulator from "../periodic/periodic-modulator";
import Oscillator from "../oscillator/ideal-oscillator";
import OscillatorWorkletNode from "../oscillator/oscillator-worklet-node";

/* eslint-disable */
import worklet from "../oscillator/oscillator.worklet.js";
/* eslint-enable */

/**
    INPUTS:
        planned (TODO):
        - LFO.syncFrequencyIn
        - LFO.syncPhaseIn

    OUTPUTS:
        - LFO.output (connected by LFO.connect(...)): full range (-1 to 1)
        - LFO.outputs.positive (connected by LFO.)
        - LFO.outputs.negative
        planned (TODO):
        - LFO.frequencyOut
        - LFO.phaseOut

*/

class LFO extends PeriodicModulator {

    constructor (...args) {
        super(...args);
        const [, , , index] = args;

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
            //this.frequency = this.state.frequency;
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
                //this.frequency = this.state.frequency;
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
