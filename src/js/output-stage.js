import {inputNode} from "./shared-functions";

class OutputStage {

    static inputDefs = [
        {
            name: "gain"
        },
        {
            name: "pan"
        }
    ];

    constructor (context, dc, active) {

        this.context = context;
        this.input = context.createGain();
        this.input.gain.setValueAtTime(0, context.currentTime);
        this.panner = context.createStereoPanner();
        this.panner.pan.setValueAtTime(0, context.currentTime);

        // this is the output stage, used for muting
        this.output = context.createGain();
        this.output.gain.setValueAtTime(0, context.currentTime);

        // signal path: source -> input -> panner -> output

        this.parameters = {};

        const p = this.parameters;

        p.gain = inputNode(context);
        p.gain.connect(this.input.gain);

        p.pan = inputNode(context);
        p.pan.connect(this.panner.pan);

        //connect signal path
        this.input.connect(this.panner);
        this.panner.connect(this.output);

        this.active = active;
    }

    get targets () {
        return this.parameters;
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
        this.constructor.inputDefs.forEach((def) => {
            this.parameters[def.name].disconnect();
            this.parameters[def.name] = null;
        });

        this.gain = null;
        this.input.disconnect();
        this.input = null;
        this.state = null;
    }
}


export default OutputStage;
