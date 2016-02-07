/* global module, require */
"use strict";
var DC = require("./DCGenerator"),
    SubOscillator;

SubOscillator = function (context, patch, frequency) {
    var dc = new DC(context),
        result;

    this.oscillator = context.createOscillator();
    this.oscillator.frequency.value = 0;
    this.oscillator.type = "sine";
    this.gainNode = context.createGain();
    this.gain = this.gainNode.gain;
    this.gain.value = 0;

    this.frequencyNode = context.createGain();
    dc.connect(this.frequencyNode);
    this.frequencyNode.gain.value = frequency;

    this.ratioNode = context.createGain();
    this.ratioNode.gain.value = patch.ratio;
    this.frequencyNode.connect(this.ratioNode);
    this.ratioNode.connect(this.oscillator.frequency);

    this.output = context.createGain();
    this.output.gain.value = patch.active ? 1 : 0;

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.output);

    result = {
        "start": this.oscillator.start.bind(this.oscillator),
        "stop": this.oscillator.stop.bind(this.oscillator),
        "connect": this.output.connect.bind(this.output),
        "disconnect": this.output.disconnect.bind(this.output),
        "destroy": this.destroy,
        // exposed audio parameters
        "gain": this.gain,
        "frequency": this.frequencyNode.gain,
        "ratio": this.ratioNode.gain
    };
    return result;
};
SubOscillator.prototype.destroy = function destroySubOscillator() {
    this.oscillator = null;
    this.gainNode = null;
    this.frequencyNode = null;
    this.ratioNode = null;
    this.output = null;
};
SubOscillator.getModulationInputDescriptors = function () {
    return {
        "gain": {
            "min": 0,
            "max": 1
        }
    };
};

module.exports = SubOscillator;