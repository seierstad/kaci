import autobind from "autobind-decorator";

import KaciAudioNode from "./kaci-audio-node";
import {BUFFER_LENGTH} from "./constants";
import noise from "./noise";
import worklet from "./worklets/oscillator.worklet.js";
import NoiseWorkletNode from "./oscillator-worklet-node";

class Noise extends KaciAudioNode {

    constructor (...args) {
        super(...args);
        const [context, store, patch] = args;

        this.generator = null;
        this.parameters = {...this.outputStage.parameters};
        this.isWorklet = true;

        if (!this.context.audioWorklet) {
            this.isWorklet = false;
            this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);
            this.generator.connect(this.outputStage.input);
            this.active = patch.active;
            this.color = patch.color;
        }
    }

    get targets () {
        return this.parameters;
    }

    set color (color) {
        if (typeof noise[color] === "function") {
            if (!this.isWorklet) {
                this.generatorFunction = noise[color]();
            } else {
                this.generator.port.postMessage(JSON.stringify({color}));
            }
        }
    }

    @autobind
    init () {
        const that = this;
        if (this.isWorklet) {
            return this.context.audioWorklet.addModule(worklet).then(() => {
                this.generator = new NoiseWorkletNode(this.context);
                this.generator.connect(this.outputStage.input);
                this.color = this.state.color;
                this.generator.port.postMessage(JSON.stringify({"waveform": "saw"}));
                return that;
            });
        }

        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }

    start () {
        if (!this.isWorklet) {
            this.generator.addEventListener("audioprocess", this.audioProcessHandler);
        } else {
            this.generator.port.postMessage(JSON.stringify({"command": "start"}));
        }
    }

    stop () {
        if (!this.isWorklet) {
            this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
        } else {
            this.generator.port.postMessage(JSON.stringify({"command": "stop"}));
        }
    }

    @autobind
    audioProcessHandler (event) {
        const output = event.outputBuffer.getChannelData(0);

        this.generatorFunction(output);
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


export default Noise;
