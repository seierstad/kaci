import DC from "./DCGenerator";
import {inputNode, outputNode} from "./SharedFunctions";

class SubOscillator {
    constructor (context, patch, frequency, scaleBaseNumber = 2) {

        /* start common constructor code */

        this.dc = new DC(context);
        this.context = context;
        this.state = patch;

        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0;
        this.pannerNode = context.createStereoPanner();
        this.pannerNode.pan.value = 0;

        // this is the output stage, used for muting
        this.output = context.createGain();
        this.output.gain.setValueAtTime(this.state.active ? 1 : 0, this.context.currentTime);

        // signal path: source -> gainNode -> pannerNode -> output

        this.parameters = {
            "targets": {},
            "sources": {}
        };

        const t = this.parameters.targets;

        // gain stage, between source and panner/output
        t.gain = inputNode(context);
        t.gain.connect(this.gainNode.gain);


        t.pan = inputNode(context);
        t.pan.connect(this.pannerNode.pan);

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


        // standard detune
        this.detuneNode = context.createGain();
        this.dc.connect(this.detuneNode);
        this.detuneNode.gain.value = 0;
        this.detuneNode.gain.setValueAtTime(this.state.mode === "detune" ? (this.state.detune * 100) : 0, this.context.currentTime);
        this.detuneNode.connect(this.generator.detune);

        // shift frequency down 0/1/2 octaves
        this.scaleBaseNumber = scaleBaseNumber;
        this.ratioNode = context.createGain();
        this.ratioNode.gain.value = Math.pow(this.scaleBaseNumber, this.state.depth);

        // linear beat frequency :)
        this.frequencyOffsetNode = context.createGain();
        this.dc.connect(this.frequencyOffsetNode);
        this.frequencyOffsetNode.gain.value = 0;
        this.frequencyOffsetNode.gain.setValueAtTime(this.state.mode === "beat" ? this.state.beat : 0, this.context.currentTime);
        this.frequencyOffsetNode.connect(this.ratioNode);

        this.frequencyNode.connect(this.ratioNode);
        this.ratioNode.connect(this.generator.frequency);
        this.ratio = this.ratioNode.gain;


        t.beat = inputNode(context);
        t.beat.connect(this.frequencyOffsetNode.gain);

        t.detune = inputNode(context);
        t.detune.connect(this.detuneNode.gain);



        this.generator.connect(this.gainNode);
    }

    start () {
        this.generator.start();
    }

    stop () {
        this.generator.stop();
    }

    set active (active) {
        if (this.state.active !== active) {
            this.output.gain.setValueAtTime(active ? 1 : 0, this.context.currentTime);
            this.state.active = active;
        }
    }

    set frequency (frequency) {
        this.frequencyNode.gain.setValueAtTime(frequency, this.context.currentTime);
    }

    set scaleFactor (factor) {
        this.scaleBaseNumber = factor;
        this.ratioNode.gain.setValueAtTime(Math.pow(this.scaleBaseNumber, this.state.depth), this.context.currentTime);
    }

    set mode (mode) {
        if (this.state.mode !== mode) {

            if (mode === "beat") {

                this.detuneNode.gain.setValueAtTime(0, this.context.currentTime);
                this.frequencyOffsetNode.gain.setValueAtTime(this.state.beat, this.context.currentTime);

            } else if (mode === "detune") {

                this.frequencyOffsetNode.gain.setValueAtTime(0, this.context.currentTime);
                this.detuneNode.gain.setValueAtTime(this.state.detune * 100, this.context.currentTime);
            }

            this.state.mode = mode;
        }
    }

    set beat (beat) {
        if (this.state.beat !== beat) {

            if (this.state.mode === "beat") {
                this.frequencyOffsetNode.gain.setValueAtTime(beat, this.context.currentTime);
            }

            this.state.beat = beat;
        }
    }

    set detune (detune) {
        if (this.state.detune !== detune) {

            if (this.state.mode === "detune") {
                this.detuneNode.gain.setValueAtTime(detune * 100, this.context.currentTime);
            }

            this.state.detune = detune;
        }
    }

    connect (node) {
        this.output.connect(node);
    }

    disconnect () {
        this.output.disconnect();
    }

    destroy () {
        this.pannerNode.disconnect();
        this.pannerNode = null;
        this.gainNode.disconnect();
        this.gainNode = null;
        this.frequencyNode.disconnect();
        this.frequencyNode = null;
        this.ratioNode.disconnect();
        this.ratioNode = null;
        this.frequencyOffsetNode.disconnect();
        this.frequencyOffsetNode = null;
        this.generator.disconnect();
        this.generator = null;
        this.output = null;
    }
}

export default SubOscillator;
