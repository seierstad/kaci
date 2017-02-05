import {BUFFER_LENGTH} from "./constants";
import {ParamLogger, inputNode, outputNode} from "./SharedFunctions";
import DC from "./DCGenerator";
import {noise as noiseFunctions} from "./waveforms";


class Noise {
    constructor (context, patch) {
        /* start common constructor code */

        this.dc = new DC(context);
        this.state = patch;

        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0;
        this.pannerNode = context.createStereoPanner();
        this.pannerNode.pan.value = 0;

        // this is the output stage, used for muting
        this.output = context.createGain();
        this.output.gain.setValueAtTime(this.state.active ? 1 : 0, context.currentTime);

        // signal path: source -> gainNode -> pannerNode -> output

        this.parameters = {
            "targets": {},
            "sources": {}
        };

        const t = this.parameters.targets;

        t.gain = inputNode(context);
        t.gain.connect(this.gainNode.gain);

        t.pan = inputNode(context);
        t.pan.connect(this.pannerNode.pan);

        //connect signal path
        this.gainNode.connect(this.pannerNode);
        this.pannerNode.connect(this.output);


        /* end common constructor code */

        this.audioProcessHandler = this.audioProcessHandler.bind(this);
        this.generatorFunction = noiseFunctions[this.state.color];
        this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);
        this.generator.connect(this.gainNode);
    }


    set color (color) {
        if (color !== this.state.color && typeof noiseFunctions[color] === "function") {
            this.generatorFunction = noiseFunctions[color];
            this.state.color = color;
        }
    }

    get color () {
        return this.state.color;
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
        this.output.connect(node);
    }

    disconnect () {
        this.output.disconnect();
    }

    destroy () {
        this.stateChangeHandler = null;
        this.audioProcessHandler = null;
        this.generatorFunction = null;
        this.generator.disconnect();
        this.generator = null;
        this.gain = null;
        this.gainNode.disconnect();
        this.gainNode = null;
        this.state = null;
    }
}


export default Noise;
