import {BUFFER_LENGTH} from "./constants";
import {ParamLogger, PannableModule} from "./SharedFunctions";
import DC from "./DCGenerator";
import {noise as noiseFunctions} from "./waveforms";


class Noise extends PannableModule {
    constructor(context, store) {
        super();
        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.store = store;
        this.state = store.getState().patch.noise;
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0;
        this.pannerNode = context.createStereoPanner();
        this.pannerNode.pan.value = 0;

        // this is the output, used for muting
        this.output = context.createGain();
        this.output.gain.setValueAtTime(this.state.active ? 1 : 0, this.context.currentTime);

        // signal path: source -> gainNode -> pannerNode -> output

        this.parameters = {
            "inputs": {},
            "outputs": {}
        };

        const i = this.parameters.inputs;
        const o = this.parameters.outputs;

        // gain stage, between source and panner/output
        o.gain = this.outputNode(this.state.gain);
        this.gain = o.gain.gain;

        i.gain = this.inputNode();
        o.gain.connect(i.gain);

        i.gain.connect(this.gainNode.gain);

        o.pan = this.outputNode(this.state.pan);
        this.pan = o.pan.gain;

        i.pan = this.inputNode();
        o.pan.connect(i.pan);

        i.pan.connect(this.pannerNode.pan);

        //connect signal path
        this.gainNode.connect(this.pannerNode);
        this.pannerNode.connect(this.output);


        /* end common constructor code */


        const now = context.currentTime;

        this.audioProcessHandler = this.audioProcessHandler.bind(this);
        this.generatorFunction = noiseFunctions[this.state.color];
        this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);

        this.generator.connect(this.gainNode);

        //        this.logger = new ParamLogger(this.parameters.inputs.gain, this.context);

    }

    stateChangeHandler() {
        const newState = this.store.getState().patch.noise;
        if (newState !== this.state) {
            if (this.state.pan !== newState.pan) {
                this.pan.setValueAtTime(newState.pan, this.context.currentTime);
            }
            if (this.state.gain !== newState.gain) {
                this.gain.setValueAtTime(newState.gain, this.context.currentTime);
            }
            if (this.state.color !== newState.color && noiseFunctions[newState.color]) {
                this.generatorFunction = noiseFunctions[newState.color];
            }
            this.state = newState;
        }
    }
    start() {
        this.generator.addEventListener("audioprocess", this.audioProcessHandler);
    }
    stop() {
        this.generator.removeEventListener("audioprocess", this.audioProcessHandler);
    }
    audioProcessHandler(event) {
        var output = event.outputBuffer.getChannelData(0);
        this.generatorFunction(output);
    }
    destroy() {
        this.unsubscribe();
        this.stateChangeHandler = null;
        this.audioProcessHandler = null;
        this.generatorFunction = null;
        this.generator.disconnect();
        this.generator = null;
        this.gain = null;
        this.gainNode.disconnect();
        this.gainNode = null;
        this.state = null;
        //        this.logger.disconnect();
    }
}


export default Noise;
