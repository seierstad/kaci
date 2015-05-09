/*global require, module, document */
"use strict";
var DCGenerator = require("./DCGenerator");
var IdealOscillator = require("./IdealOscillator");
var BUFFER_LENGTH = require("constants").BUFFER_LENGTH;

var PDOscillator = function (context, patch, frequency, options) {
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

        this[def.name + "Node"] = context.createGain();
        this.dc.connect(this[def.name + "Node"]);
        this[def.name] = this[def.name + "Node"].gain;
        this[def.name + "Node"].connect(this.mergedInput, null, i);
        useValue = (patch && !isNaN(patch[def.name])) ? patch[def.name] : def.defaultValue;
        this[def.name].value = useValue;
        this[def.name].setValueAtTime(useValue, this.context.currentTime);
    }
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
    this.frequencyNode.disconnect();
    this.frequencyNode = null;
    this.detuneNode.disconnect();
    this.detuneNode = null;
    this.resonanceNode.disconnect();
    this.resonanceNode = null;
    this.mixNode.disconnect();
    this.mixNode = null;
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
            previous = {
                frequency: 0,
                detune: 0,
                resonance: 0,
                calculatedFrequency: 0,
                calculatedResonanceFrequency: 0
            };

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
PDOscillator.prototype.linearFunctionFromVector = function (vector) {
    var rate,
        constant;
    rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    constant = vector[0][1] - (rate * vector[0][0]);
    return function linear(phase) {
        return (phase * rate) + constant;
    };
};
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
PDOscillator.prototype.getDistortedPhase = function (phase, envelope) {
    var i;

    if (envelope.length > 1) {
        for (i = 1; i < envelope.length; i += 1) {
            if (phase >= envelope[i - 1][0] && phase < envelope[i][0]) {
                if (!envelope.functions[i - 1]) {
                    envelope.functions[i - 1] = this.linearFunctionFromVector([envelope[i - 1], envelope[i]]);
                }
                return envelope.functions[i - 1](phase);
            }
        }
    }
    return 0;
};
PDOscillator.prototype.mixValues = function (source1, source2, ratio) {
    return source1 * (-ratio + 1) + source2 * ratio;
};
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
PDOscillator.prototype.DOUBLE_PI = Math.PI * 2;

PDOscillator.prototype.gaussianFunction = function (mu, sig) {
    var twoSigSquared = 2 * Math.pow(sig, 2);
    var muSquared = mu * mu;
    return function (phase) {
        return Math.exp(-(muSquared - (2 * mu * phase) + (phase * phase)) / twoSigSquared);
    };
};
PDOscillator.prototype.wrappers = {
    sync: function () {
        return 1;
    },
    saw: function (phase) {
        return 1 - phase;
    },
    halfSinus: function (phase) {
        return Math.sin(phase * Math.PI);
    },
    gaussian: function (phase) {
        // dummy function to be replaced by constructor
        // added for static enumeration purposes
    }
};
PDOscillator.getModulationInputDescriptors = function () {
    return {
        "mix": {
            "min": 0,
            "max": 1
        },
        "resonance": {
            "min": 1,
            "max": 10
        },
        "detune": {
            "min": -1200,
            "max": 1200,
            "flipWhenNegative": false,
            "midValue": "limit" // ["center", "limit"]
        }
    };
};
module.exports = PDOscillator;