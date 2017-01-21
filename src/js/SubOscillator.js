import DC from "./DCGenerator";
import {PannableModule} from "./SharedFunctions";

class SubOscillator extends PannableModule {
    constructor (context, store, frequency, scaleBaseNumber = 2) {

        super();
        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.store = store;
        this.state = store.getState().patch.sub;
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

        // simple oscillator
        this.generator = context.createOscillator();
        this.generator.frequency.value = 0;
        this.generator.type = "sine";

        // set frequency
        this.frequencyNode = context.createGain();
        this.dc.connect(this.frequencyNode);
        this.frequencyNode.gain.value = frequency;
        this.frequency = this.frequencyNode.gain;

        // shift frequency down 0/1/2 octaves
        this.scaleBaseNumber = scaleBaseNumber;
        this.ratioNode = context.createGain();
        this.ratioNode.gain.value = Math.pow(this.scaleBaseNumber, this.state.depth);

        // linear beat frequency :)
        this.frequencyOffsetNode = context.createGain();
        this.dc.connect(this.frequencyOffsetNode);
        this.frequencyOffsetNode.gain.value = 4;
        this.frequencyOffsetNode.connect(this.ratioNode);

        this.frequencyNode.connect(this.ratioNode);
        this.ratioNode.connect(this.generator.frequency);
        this.ratio = this.ratioNode.gain;


        this.generator.connect(this.gainNode);
    }
    start () {
        this.generator.start();
    }
    stop () {
        this.generator.stop();
    }

    stateChangeHandler () {

        const newState = this.store.getState().patch.sub;

        if (newState !== this.state) {
            if (this.state.pan !== newState.pan) {
                this.pan.setValueAtTime(newState.pan, this.context.currentTime);
            }
            if (this.state.gain !== newState.gain) {
                this.gain.setValueAtTime(newState.gain, this.context.currentTime);
            }
            if (this.state.depth !== newState.depth) {
                this.ratioNode.gain.setValueAtTime(Math.pow(this.scaleBaseNumber, newState.depth), this.context.currentTime);
            }
            if (this.state.active !== newState.active) {
                this.output.gain.setValueAtTime(newState.active ? 1 : 0, this.context.currentTime);
            }
            this.state = newState;
        }
    }

    set freq (frequency) {
        this.frequencyNode.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    set scaleFactor (factor) {
        this.scaleBaseNumber = factor;
        this.ratioNode.gain.setValueAtTime(Math.pow(this.scaleBaseNumber, this.state.depth), this.context.currentTime);
    }

    destroy () {
        this.unsubscribe();
        this.panner = null;
        this.generator = null;
        this.gainNode = null;
        this.frequencyNode = null;
        this.ratioNode = null;
        this.output = null;
    }
}

export default SubOscillator;
