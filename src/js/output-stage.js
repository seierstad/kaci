import {inputNode} from "./SharedFunctions";

class OutputStage {
    constructor (context, dc, active) {

        this.context = context;
        this.input = context.createGain();
        this.input.gain.value = 0;
        this.panner = context.createStereoPanner();
        this.panner.pan.value = 0;

        // this is the output stage, used for muting
        this.output = context.createGain();
        this.output.gain.value = 0;

        // signal path: source -> input -> panner -> output

        this.parameters = {
            "targets": {}
        };

        const t = this.parameters.targets;

        t.gain = inputNode(context);
        t.gain.connect(this.input.gain);

        t.pan = inputNode(context);
        t.pan.connect(this.panner.pan);

        //connect signal path
        this.input.connect(this.panner);
        this.panner.connect(this.output);

        this.active = active;
    }

    get targets () {
        return this.parameters.targets;
    }

    set active (active) {
        this.output.gain.setValueAtTime(active ? 1 : 0, this.context.currentTime);
    }

    connect (node) {
        this.output.connect(node);
    }

    disconnect () {
        this.output.disconnect();
    }

    destroy () {
        this.gain = null;
        this.input.disconnect();
        this.input = null;
        this.state = null;
    }
}


export default OutputStage;
