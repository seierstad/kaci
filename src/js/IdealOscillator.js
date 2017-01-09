/*globals require, module, CustomEvent */
"use strict";
let DCGenerator = require("./DCGenerator"),
    BUFFER_LENGTH = require("./constants").BUFFER_LENGTH;

import {
    waveforms
}
from "./waveforms";

let IdealOscillator = function (context) {
    let i,
        j,
        def,
        key,
        zeroPhaseActions;

    this.inputDefs = [{
        name: "frequency",
        defaultValue: 440
    }, {
        name: "detune",
        defaultValue: 0
    }];
    this.context = context;
    this.phase = 0;
    this.paused = false;
    this.sampleAndHoldBuffer = {
        value: null,
        phase: 0
    };
    this.dc = new DCGenerator(context);
    this.mergedInput = context.createChannelMerger(this.inputDefs.length);

    for (i = 0, j = this.inputDefs.length; i < j; i += 1) {
        def = this.inputDefs[i];

        this[def.name + "Node"] = context.createGain();
        this.dc.connect(this[def.name + "Node"]);
        this[def.name] = this[def.name + "Node"].gain;
        this[def.name].value = def.defaultValue;
        this[def.name + "Node"].connect(this.mergedInput, null, i);
    }
    this.generator = context.createScriptProcessor(BUFFER_LENGTH, this.inputDefs.length, 1);
    this.mergedInput.connect(this.generator);

};
IdealOscillator.waveforms = waveforms;
IdealOscillator.prototype.getGenerator = function (oscillator) {
    return function audioprocessHandler (evt) {

        let frequency = evt.inputBuffer.getChannelData(0),
            detune = evt.inputBuffer.getChannelData(1),
            output = evt.outputBuffer.getChannelData(0),
            i, j,
            calculatedFrequency,
            phase,
            previous = {
                frequency: 0,
                detune: 0,
                calculatedFrequency: 0
            };

        for (i = 0, j = this.bufferSize; i < j; i += 1) {
            if (frequency[i] === previous.frequency && detune[i] === previous.detune) {
                calculatedFrequency = previous.calculatedFrequency;
            } else {
                calculatedFrequency = oscillator.getComputedFrequency(frequency[i], detune[i]);
                previous.frequency = frequency[i];
                previous.detune = detune[i];
                previous.calculatedFrequency = calculatedFrequency;
            }
            phase = oscillator.getIncrementedPhase(calculatedFrequency);
            output[i] = oscillator.selectedWaveform.call(oscillator, phase);
        }
    };
};
IdealOscillator.prototype.getIncrementedPhase = function getIncrementedPhase (frequency) {
    let increment = frequency / this.context.sampleRate;
    this.phase += increment;
    if (this.phase > 1) {
        while (this.phase > 1) {
            this.phase -= 1;
        }
        this.zeroPhaseActions();
    }
    return this.phase;
};
IdealOscillator.prototype.requestZeroPhaseEvent = function requestZeroPhaseEvent (eventName) {

    if (!this.zeroPhaseEventRequested) {
        this.zeroPhaseEventRequested = [];
    }
    if (this.zeroPhaseEventRequested.indexOf(eventName) === -1) {
        this.zeroPhaseEventRequested.push(eventName);
    }
};
IdealOscillator.prototype.zeroPhaseActions = function () {
    let i, j,
        event,
        that = this;

    if (this.zeroPhaseEventRequested) {
        for (i = 0, j = this.zeroPhaseEventRequested.length; i < j; i += 1) {
            event = new CustomEvent(this.zeroPhaseEventRequested[i], {
                detail: that.frequency.value
            });
            this.context.dispatchEvent(event);
        }
        this.zeroPhaseEventRequested = false;
    }
};
IdealOscillator.prototype.resetPhase = function () {
    this.phase = 0;
    this.sampleAndHoldBuffer.phase = 0;
    this.zeroPhaseActions();
};
IdealOscillator.prototype.getComputedFrequency = function (frequency, detune) {
    return frequency * Math.pow(2, detune / 1200);
};
IdealOscillator.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
        this.generator.connect(node.input);
    } else {
        this.generator.connect(node);
    }
};
IdealOscillator.prototype.start = function () {
    if (!this.paused) {
        this.resetPhase();
    }
    this.generator.onaudioprocess = this.getGenerator(this);
    //    this.generator.addEventListener("audioprocess", this.getGenerator(this));
};
IdealOscillator.prototype.stop = function () {
    this.generator.onaudioprocess = null;

    //    this.generator.removeEventListener("audioprocess");
};
IdealOscillator.prototype.setWaveform = function (waveformName) {
    if (typeof IdealOscillator.waveforms[waveformName] === "function") {
        this.selectedWaveform = IdealOscillator.waveforms[waveformName];
    }
};
IdealOscillator.prototype.destroy = function destroyIdealOscillator () {
    let i, j, def;
    this.dc.destroy();
    this.dc = null;

    for (i = 0, j = this.inputDefs.length; i < j; i += 1) {
        def = this.inputDefs[i];
        this[def.name + "Node"].disconnect();
        this[def.name] = null;
        this[def.name + "Node"] = null;
    }
    this.mergedInput.disconnect();
    this.mergedInput = null;

    this.generator.onaudioprocess = null;
    this.generator.disconnect();
    this.generator = null;

};
module.exports = IdealOscillator;