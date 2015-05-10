/*globals require, module, CustomEvent */
"use strict";
var DCGenerator = require("./DCGenerator");
var BUFFER_LENGTH = require("./constants").BUFFER_LENGTH;
var DOUBLE_PI = require("./constants").DOUBLE_PI;

var IdealOscillator = function (context) {
    var i,
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
IdealOscillator.prototype.DOUBLE_PI = DOUBLE_PI;
IdealOscillator.waveforms = {
    zero: function zero() {
        return 0;
    },
    sinus: function sinus(phase) {
        return Math.sin(phase * this.DOUBLE_PI);
    },
    square: function square(phase) {
        if (phase > 0.5) {
            return -1;
        } else {
            return 1;
        }
    },
    additiveSquare: function additiveSquare(phase, maxHarmonic) {
        var value = 0,
            i = 1;
        maxHarmonic = maxHarmonic || 8;
        for (i = 1; i < maxHarmonic; i += 2) {
            value += Math.sin(phase * this.DOUBLE_PI * i) / i;
        }
        return value * (4 / Math.PI);
    },
    saw: function saw(phase) {
        return (phase - 0.5) * 2;
    },
    additiveSaw: function additiveSaw(phase, maxHarmonic) {
        var value = 0,
            i;
        maxHarmonic = maxHarmonic || 8;
        for (i = 1; i < maxHarmonic; i += 1) {
            value += Math.sin(phase * this.DOUBLE_PI * i) / i;
        }
        return value * (2 / Math.PI);
    },
    saw_inverse: function saw_inverse(phase) {
        return 1 - (phase * 2);
    },
    triangle: function triangle(phase) {
        if (phase < 0.25) {
            return phase * 4;
        } else if (phase < 0.75) {
            return (phase - 0.5) * -4;
        } else {
            return (phase - 1) * 4;
        }
    },
    additiveTriangle: function additiveTriangle(phase, maxHarmonic) {
        var value = 0,
            i = 1,
            odd = true;

        maxHarmonic = maxHarmonic || 5;
        for (i = 1; i < maxHarmonic; i += 2) {
            if (odd) {
                value += Math.sin(phase * this.DOUBLE_PI * i) / (i * i);
            } else {
                value -= Math.sin(phase * this.DOUBLE_PI * i) / (i * i);
            }
            odd = !odd;
        }
        return value * (8 / Math.pow(Math.PI, 2));
    },
    sampleAndHold: function sampleAndHold(phase, steps) {
        var fraction;
        steps = steps || 2;
        fraction = 1 / steps;
        if (!this.sampleAndHoldBuffer) {
            this.sampleAndHoldBuffer = {
                value: null,
                phase: 0
            };
        }
        if (this.sampleAndHoldBuffer.value === null) {
            this.sampleAndHoldBuffer.value = (Math.random() - 0.5) * 2;
        }
        if (Math.ceil(phase / fraction) > Math.ceil(this.sampleAndHoldBuffer.phase / fraction)) {
            this.sampleAndHoldBuffer.value = (Math.random() - 0.5) * 2;
        }
        this.sampleAndHoldBuffer.phase = phase;
        return this.sampleAndHoldBuffer.value;
    }
};
IdealOscillator.prototype.getGenerator = function (oscillator) {
    return function audioprocessHandler(evt) {

        var frequency = evt.inputBuffer.getChannelData(0),
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
IdealOscillator.prototype.getIncrementedPhase = function getIncrementedPhase(frequency) {
    var increment = frequency / this.context.sampleRate;
    this.phase += increment;
    if (this.phase > 1) {
        while (this.phase > 1) {
            this.phase -= 1;
        }
        this.zeroPhaseActions();
    }
    return this.phase;
};
IdealOscillator.prototype.requestZeroPhaseEvent = function requestZeroPhaseEvent(eventName) {

    if (!this.zeroPhaseEventRequested) {
        this.zeroPhaseEventRequested = [];
    }
    if (this.zeroPhaseEventRequested.indexOf(eventName) === -1) {
        this.zeroPhaseEventRequested.push(eventName);
    }
};
IdealOscillator.prototype.zeroPhaseActions = function () {
    var i, j,
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
    this.generator.addEventListener("audioprocess", this.getGenerator(this));
};
IdealOscillator.prototype.stop = function () {
    this.generator.removeEventListener("audioprocess");
};
IdealOscillator.prototype.setWaveform = function (waveformName) {
    if (typeof IdealOscillator.waveforms[waveformName] === "function") {
        this.selectedWaveform = IdealOscillator.waveforms[waveformName];
    }
};
IdealOscillator.prototype.destroy = function destroyIdealOscillator() {
    var i, j, def;
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

    this.generator.removeEventListener("audioprocess");
    this.generator.disconnect();
    this.generator = null;

};
module.exports = IdealOscillator;