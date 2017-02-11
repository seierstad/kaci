import {BUFFER_LENGTH} from "./constants";
import {inputNode} from "./SharedFunctions";
import {noise} from "./waveforms";
import OutputStage from "./output-stage";

class Noise {
    constructor (context, dc, patch) {

        this.state = {...patch};

        // gain, pan and mute
        this.outputStage = new OutputStage(context, dc, !!patch.active);
        this.parameters = {...this.outputStage.parameters};


        this.audioProcessHandler = this.audioProcessHandler.bind(this);
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
            this.generatorFunction = noise[color];
        }
    }

    set active (active) {
        this.outputStage.active = active;
    }

    start () {
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }

    stop () {
        this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
    }

    audioProcessHandler (event) {
        let output = event.outputBuffer.getChannelData(0);
        this.generatorFunction(output);
    }

    connect (node) {
        this.outputStage.connect(node);
    }

    disconnect () {
        this.outputStage.disconnect();
    }

    destroy () {
        this.audioProcessHandler = null;
        this.generatorFunction = null;
        this.generator.disconnect();
        this.generator = null;
        this.state = null;
        this.outputStage.destroy();
        this.outputStage = null;
    }
}


export default Noise;
