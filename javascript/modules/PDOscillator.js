/*global require, module, document */
"use strict";
import {
    wrappers
}
from "./waveforms";

import {
    mixValues,
    vectorToLinearFunction,
    getDistortedPhase
}
from "./sharedFunctions";


var DCGenerator = require("./DCGenerator"),
    IdealOscillator = require("./IdealOscillator"),
    BUFFER_LENGTH = require("constants").BUFFER_LENGTH,
    PDOscillator;

PDOscillator = function (context, patch, frequency, options) {
    var inputDefs = [{
            name: "frequency",
            defaultValue: frequency || 440
        }, {
            name: "detune",
            defaultValue: 0
        }, {
            name: "resonance",
            defaultValue: 1
        }, {
            name: "mix",
            defaultValue: 0
        }],
        i,
        j,
        def,
        key,
        useValue,
        that = this;

    this.wrappers.gaussian = this.gaussianFunction(0.5, 0.1);
    this.pdEnvelope0 = [];
    this.pdEnvelope1 = [];

    patch.pdEnvelope0.forEach(function (point) {
        that.pdEnvelope0.push([point[0], point[1]]);
    });

    this.pdEnvelope0.functions = [];
    patch.pdEnvelope1.forEach(function (point) {
        that.pdEnvelope1.push([point[0], point[1]]);
    });
    this.pdEnvelope1.functions = [];

    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                this[key] = options[key];
            }
        }
    }

    this.context = context;
    this.phase = 0;
    this.resonancePhase = 0;
    this.sampleAndHoldBuffer = {
        value: null,
        phase: 0
    };
    if (patch) {
        if (typeof IdealOscillator.waveforms[patch.waveform] === "function") {
            this.selectedWaveform = IdealOscillator.waveforms[patch.waveform];
        }
        if (typeof this.wrappers[patch.wrapper] === "function") {
            this.selectedWrapper = this.wrappers[patch.wrapper];
        }
        this.resonanceActive = patch.resonanceActive;
    } else {
        this.selectedWaveform = IdealOscillator.waveforms.additiveSaw;
        this.resonanceActive = false;
        this.selectedWrapper = this.wrappers.saw;
    }
    if (!this.dc) {
        this.dc = new DCGenerator(context);
    }
    this.mergedInput = context.createChannelMerger(inputDefs.length);

    for (i = 0, j = inputDefs.length; i < j; i += 1) {
        def = inputDefs[i];

        this[def.name] = context.createGain();
        //        this.dc.connect(this[def.name + "Node"]);
        this[def.name].connect(this.mergedInput, null, i);
        /*
        useValue = (patch && !isNaN(patch[def.name])) ? patch[def.name] : def.defaultValue;
        this[def.name].value = useValue;
        this[def.name].setValueAtTime(useValue, this.context.currentTime);
*/
    }
    //set frequency
    this.dc.connect(this.frequency);
    this.frequency.gain.value = frequency || 440;
    this.frequency.gain.setValueAtTime(frequency || 440, this.context.currentTime);

    this.generatorFunction = this.getGenerator(this);
    this.generator = context.createScriptProcessor(BUFFER_LENGTH, inputDefs.length, 1);
    this.generator.addEventListener("audioprocess", this.generatorFunction);

    this.mergedInput.connect(this.generator);
};
PDOscillator.prototype.setPDEnvelope0 = function (data) {
    this.pdEnvelope0 = [];
    data.forEach(function (point) {
        this.pdEnvelope0.push([point[0], point[1]]);
    }, this);
    this.pdEnvelope0.functions = [];
};
PDOscillator.prototype.setPDEnvelope1 = function (data) {
    this.pdEnvelope1 = [];
    data.forEach(function (point) {
        this.pdEnvelope1.push([point[0], point[1]]);
    }, this);
    this.pdEnvelope1.functions = [];
};
PDOscillator.prototype.addPDEnvelopePoint = function (id, index, data) {
    this["pdEnvelope" + id].splice(index, 0, data);
    this["pdEnvelope" + id].functions = [];
};
PDOscillator.prototype.movePDEnvelopePoint = function (id, index, data) {
    this["pdEnvelope" + id][index] = data;
    this["pdEnvelope" + id].functions = [];
};
PDOscillator.prototype.deletePDEnvelopePoint = function (id, index) {
    this["pdEnvelope" + id].splice(index, 1);
    this["pdEnvelope" + id].functions = [];
};
PDOscillator.prototype.getChangeWaveformHandler = function (osc) {
    return function (evt) {
        osc.setWaveform(evt.detail);
    };
};
PDOscillator.prototype.destroy = function () {
    this.frequency.disconnect();
    this.frequency = null;
    this.detune.disconnect();
    this.detune = null;
    this.resonance.disconnect();
    this.resonance = null;
    this.mix.disconnect();
    this.mix = null;
    this.mergedInput.disconnect();
    this.mergedInput = null;
    this.generator.disconnect();
    this.generator.removeEventListener("audioprocess", this.generatorFunction);
    this.generator = null;
    this.generatorFunction = null;
    if (this.destroyCallback && typeof this.destroyCallback === "function") {
        this.destroyCallback(this);
    }
};
PDOscillator.prototype.getGenerator = function (oscillator) {
    return function audioprocessHandler(evt) {
        var frequency = evt.inputBuffer.getChannelData(0),
            detune = evt.inputBuffer.getChannelData(1),
            resonance = evt.inputBuffer.getChannelData(2),
            mix = evt.inputBuffer.getChannelData(3),
            output = evt.outputBuffer.getChannelData(0),
            i, j,
            calculatedFrequency,
            calculatedResonanceFrequency,
            phase,
            wrapperPhase,
            distortedPhase0,
            distortedPhase1,
            distortedPhaseMix,
            debugVisible = true,
            previous = {
                frequency: 0,
                detune: 0,
                resonance: 0,
                calculatedFrequency: 0,
                calculatedResonanceFrequency: 0
            };
        /*        if (debugVisible) {
            console.log("mix: " + mix[0] + " resonance: " + resonance[0] + " detune: " + detune[0]);

            debugVisible = false;
        }
*/
        for (i = 0, j = this.bufferSize; i < j; i += 1) {
            if (frequency[i] === previous.frequency && detune[i] === previous.detune) {
                calculatedFrequency = previous.calculatedFrequency;
            } else {
                calculatedFrequency = oscillator.getComputedFrequency(frequency[i], detune[i]);
                previous.frequency = frequency[i];
                previous.detune = detune[i];
            }
            if (previous.calculatedFrequency === calculatedFrequency && resonance[i] === previous.resonance) {
                calculatedResonanceFrequency = previous.calculatedFrequency;
            } else {
                calculatedResonanceFrequency = calculatedFrequency * resonance[i];
            }
            previous.calculatedFrequency = calculatedFrequency;

            phase = oscillator.getIncrementedPhase(calculatedFrequency);
            wrapperPhase = oscillator.getIncrementedResonancePhase(calculatedResonanceFrequency);

            if (!oscillator.resonanceActive) {
                distortedPhase0 = oscillator.getDistortedPhase(phase, oscillator.pdEnvelope0);
                distortedPhase1 = oscillator.getDistortedPhase(phase, oscillator.pdEnvelope1);
                distortedPhaseMix = oscillator.mixValues(distortedPhase0, distortedPhase1, mix[i]);

                output[i] = oscillator.selectedWaveform.call(oscillator, distortedPhaseMix);
            } else {
                distortedPhase0 = oscillator.getDistortedPhase(wrapperPhase, oscillator.pdEnvelope0);
                distortedPhase1 = oscillator.getDistortedPhase(wrapperPhase, oscillator.pdEnvelope1);
                distortedPhaseMix = oscillator.mixValues(distortedPhase0, distortedPhase1, mix[i]);

                output[i] = oscillator.selectedWaveform.call(oscillator, distortedPhaseMix) * oscillator.selectedWrapper.call(oscillator, phase);
            }
        }
    };
};
PDOscillator.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
        this.generator.connect(node.input);
    } else {
        this.generator.connect(node);
    }
};
PDOscillator.prototype.linearFunctionFromVector = vectorToLinearFunction;
PDOscillator.prototype.setWaveform = function (waveformName) {
    if (waveformName && IdealOscillator.waveforms[waveformName] && typeof IdealOscillator.waveforms[waveformName] === "function") {
        this.selectedWaveform = IdealOscillator.waveforms[waveformName];
    }
    return this;
};
PDOscillator.prototype.setWrapper = function (wrapperName) {
    if (wrapperName && this.wrappers[wrapperName] && typeof this.wrappers[wrapperName] === "function") {
        this.selectedWrapper = this.wrappers[wrapperName];
    }
    return this;
};
PDOscillator.prototype.getIncrementedPhase = function (frequency) {
    var increment = frequency / this.context.sampleRate;
    this.phase += increment;
    while (this.phase > 1) {
        this.phase -= 1;
        this.resonancePhase = 0;
    }
    return this.phase;
};
PDOscillator.prototype.getDistortedPhase = getDistortedPhase;
PDOscillator.prototype.mixValues = mixValues;
PDOscillator.prototype.getIncrementedResonancePhase = function (frequency) {
    var increment = frequency / this.context.sampleRate;
    this.resonancePhase += increment;
    while (this.resonancePhase > 1) {
        this.resonancePhase -= 1;
    }
    return this.resonancePhase;
};
PDOscillator.prototype.getComputedFrequency = function (frequency, detune) {
    return frequency * Math.pow(2, detune / 1200);
};

PDOscillator.prototype.gaussianFunction = function (mu, sig) {
    var twoSigSquared = 2 * Math.pow(sig, 2),
        muSquared = mu * mu;

    return function (phase) {
        return Math.exp(-(muSquared - (2 * mu * phase) + (phase * phase)) / twoSigSquared);
    };
};
PDOscillator.prototype.wrappers = wrappers;

module.exports = PDOscillator;