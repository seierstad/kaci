import {BUFFER_LENGTH} from "./constants";
import {inputNode} from "./SharedFunctions";
import DC from "./DCGenerator";
import {noise} from "./waveforms";
import OutputStage from "./output-stage";

class Noise {
    constructor (context, patch) {
        /* start common constructor code */

        this.dc = new DC(context);
        this.state = patch;

        // gain, pan and mute
        this.outputStage = new OutputStage(context, this.dc, !!patch.active);


        this.parameters = {
            "targets": {...this.outputStage.targets}
        };


        this.audioProcessHandler = this.audioProcessHandler.bind(this);
        this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);
        this.generator.connect(this.outputStage.input);

        this.active = patch.active;
        this.color = patch.color;
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
