/* global module, require */
"use strict";
var DC = require("./DCGenerator");
var SubOscillator = function (context, patch, frequency) {
    this.oscillator = context.createOscillator();
    this.oscillator.frequency.value = 0;
    this.oscillator.type = "sine";
    this.gainNode = context.createGain();
    this.gain = this.gainNode.gain;
    this.gain.value = patch.amount;

    var dc = new DC(context);
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

    var result = {
        "start": this.oscillator.start.bind(this.oscillator),
        "stop": this.oscillator.stop.bind(this.oscillator),
        "connect": this.output.connect.bind(this.output),
        "disconnect": this.output.disconnect.bind(this.output),
        // exposed audio parameters
        "gain": this.gain,
        "frequency": this.oscillator.frequency,
        "ratio": this.ratioNode.gain
    };
    return result;
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