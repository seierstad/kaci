import autobind from "autobind-decorator";

import KaciNode from "./kaci-node";
import {BUFFER_LENGTH} from "./constants";
import {waveforms} from "./waveforms";
import worklet from "./worklets/oscillator.worklet.js";
import OscillatorWorkletNode from "./oscillator-worklet-node";

class Oscillator extends KaciNode {

    constructor (...args) {
        super(...args);
        const [context, store, patch] = args;

        this.generator = null;
        //this.parameters = {...this.outputStage.parameters};
    }

    get targets () {
        return this.parameters;
    }

    set waveform (waveform) {
        if (typeof waveforms[waveform] === "function") {
            this.generator.port.postMessage(JSON.stringify({waveform}));
        }
    }

    set frequency (frequency) {
        this.generator.port.postMessage(JSON.stringify({frequency}));
    }

    set sampleRate (sampleRate) {
        this.generator.port.postMessage(JSON.stringify({sampleRate}));
    }

    @autobind
    init () {
        return this.context.audioWorklet.addModule(worklet).then(() => {
            this.generator = new OscillatorWorkletNode(this.context);
            this.sampleRate = this.context.sampleRate;
            this.waveform = this.state.waveform;
            return this;
        });
    }

    start () {
        this.generator.port.postMessage({"command": "start"});
    }

    stop () {
        this.generator.port.postMessage({"command": "stop"});
    }

    @autobind
    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.generator.connect(node.input);
        } else {
            this.generator.connect(node);
        }
    }

    disconnect () {
        this.generator.disconnect();
    }

    destroy () {
        this.disabled = true;
        if (this.generator && this.generator.disconnect) {
            this.generator.disconnect();
            this.generator = null;
        }
        super.destroy();
    }
}


export default Oscillator;
