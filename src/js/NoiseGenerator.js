import autobind from "autobind-decorator";

import KaciAudioNode from "./kaci-audio-node";
import {BUFFER_LENGTH} from "./constants";
import {noise} from "./waveforms";
import OutputStage from "./output-stage";

class Noise extends KaciAudioNode {

    constructor (...args) {
        super(...args);
        const [context, dc, store, patch] = args;

        this.parameters = {...this.outputStage.parameters};

        this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);
        this.generator.connect(this.outputStage.input);

        this.active = patch.active;
        this.color = patch.color;
    }

    get targets () {
        return this.parameters;
    }

    set color (color) {
        if (typeof noise[color] === "function") {
            this.generatorFunction = noise[color]();
        }
    }

    start () {
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }

    stop () {
        this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
    }

    @autobind
    audioProcessHandler (event) {
        const output = event.outputBuffer.getChannelData(0);

        this.generatorFunction(output);
    }

    destroy () {
        this.generator.disconnect();
        this.generator = null;
        super.destroy();
    }
}


export default Noise;
