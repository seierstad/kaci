import autobind from "autobind-decorator";
import KaciNode from "../kaci-node";
import LFO from "./lfos-worklet";


class LFOsNode extends KaciNode {

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
            this.frequency = this.state.speed.frequency;
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
                that.oscillator = new OscillatorWorkletNode(that.context);
                that.oscillator.connect(this.postGain);
                for (let name in that.outputs) {
                    that.oscillator.connect(that.outputs[name]);
                }
                that.waveform = that.state.waveform;
                that.frequency = that.state.speed.frequency;
                return that;
            });
        }


        return new Promise((resolve) => {
            resolve(this);
        });
    }
    /*
        return Promise.all(this.lfos.map(lfo => lfo.init()));
    }
*/
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
