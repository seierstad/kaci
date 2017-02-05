import DC from "./DCGenerator";
import {inputNode, outputNodeexport, ParamLogger} from "./SharedFunctions";


import OutputStage from "./output-stage";

class SubOscillator {
    constructor (context, patch, frequency, scaleBaseNumber = 2) {

        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.state = {...patch};

        // gain, pan and mute
        this.outputStage = new OutputStage(context, this.dc, !!patch.active);

        this.parameters = {
            "targets": {...this.outputStage.targets}
        };

        // simple oscillator
        this.generator = context.createOscillator();
        this.generator.frequency.value = 0;
        this.generator.type = "sine";

        // set frequency
        this.frequencyNode = context.createGain();
        this.frequencyNode.gain.value = 0;
        this.dc.connect(this.frequencyNode);


        // multiply semitones by 100 to get cents
        this.detuneNode = context.createGain();
        this.detuneNode.gain.value = 0;
        this.detuneNode.gain.setValueAtTime(100, context.currentTime);

        // detune, in semitones
        this.semitoneNode = context.createGain();
        this.semitoneNode.gain.value = 0;
        this.dc.connect(this.semitoneNode);
        this.semitoneNode.connect(this.detuneNode);


        // linear beat frequency :)
        this.frequencyOffsetNode = context.createGain();
        this.frequencyOffsetNode.gain.value = 0;
        this.dc.connect(this.frequencyOffsetNode);

        // shift frequency down 0/1/2 octaves
        this.ratioNode = context.createGain();
        this.ratioNode.gain.value = 0;

        this.frequencyNode.connect(this.ratioNode);
        this.ratioNode.connect(this.generator.frequency);
        this.generator.connect(this.outputStage.input);


        const t = this.parameters.targets;
        t.beat = inputNode(context);
        t.beat.connect(this.frequencyOffsetNode.gain);

        t.detune = inputNode(context);
        t.detune.connect(this.semitoneNode.gain);


        this.logger = new ParamLogger(this.frequencyNode, this.context, "frequencyNode: ");

        this.frequency = frequency;
        this.scaleBaseNumber = scaleBaseNumber;
        this.depth = patch.depth;
        this.mode = patch.mode;
        this.active = patch.active;
    }

    start () {
        this.generator.start();
    }

    stop () {
        this.generator.stop();
    }

    set active (active) {
        this.outputStage.active = active;
    }

    set frequency (frequency) {
        this.frequencyNode.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    set scaleBaseNumber (scaleBaseNumber) {
        this.ratioNode.gain.setValueAtTime(Math.pow(scaleBaseNumber, this.state.depth), this.context.currentTime);
        this.state.scaleBaseNumber = scaleBaseNumber;
    }

    set depth (depth) {
        this.ratioNode.gain.setValueAtTime(Math.pow(this.state.scaleBaseNumber, depth), this.context.currentTime);
        this.state.depth = depth;
    }

    set mode (mode) {
        if (mode === "beat") {
            this.frequencyOffsetNode.connect(this.ratioNode);
            this.detuneNode.disconnect();

        } else if (mode === "semitone") {
            this.frequencyOffsetNode.disconnect();
            this.detuneNode.connect(this.generator.detune);
        }

        this.state.mode = mode;
    }

    connect (node) {
        this.outputStage.connect(node);
    }

    disconnect () {
        this.outputStage.disconnect();
    }

    destroy () {
        this.logger.disconnect();
        this.logger.destroy();
        this.logger = null;
        this.frequencyNode.disconnect();
        this.frequencyNode = null;
        this.ratioNode.disconnect();
        this.ratioNode = null;
        this.frequencyOffsetNode.disconnect();
        this.frequencyOffsetNode = null;
        this.generator.disconnect();
        this.generator = null;
        this.outputStage.destroy();
        this.outputStage = null;
    }
}

export default SubOscillator;
