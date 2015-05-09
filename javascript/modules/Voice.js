/*global require, module, setTimeout */
"use strict";
var EnvelopeGenerator = require("./EnvelopeGenerator");
var PDOscillator = require("./PDOscillator");
var NoiseGenerator = require("./NoiseGenerator");
var SubOscillator = require("./SubOscillator");
var LFO = require("./LFO");

var Voice = function (context, patch, frequency, options) {
    var key,
        i, j,
        that = this;

    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                this[key] = options[key];
            }
        }
    }
    this.context = context;
    this.vcaNode = context.createGain();
    this.vca = this.vcaNode.gain;
    this.vca.value = 1;
    this.envelope = [];
    this.lfo = [];

    var createVoiceLfo = function (lfoPatch, index) {
        if (lfoPatch.mode === "voice") {
            that.lfo[index] = new LFO(context, lfoPatch, "lfo" + index, {});
        }
    };
    patch.lfo.forEach(createVoiceLfo);

    for (i = 0, j = patch.envelope.length; i < j; i += 1) {
        this.envelope[i] = new EnvelopeGenerator(context, patch.envelope[i], "envelope" + i);
    }


    this.noise = new NoiseGenerator(context, patch.noise);
    this.sub = new SubOscillator(context, patch.sub, frequency);
    this.oscillator = new PDOscillator(context, patch.oscillator, frequency, options);

    if (typeof context.createStereoPanner === "function") {
        this.subPanner = context.createStereoPanner();
        this.sub.connect(this.subPanner);
        this.subPanner.connect(this.vcaNode);
        this.sub.pan = this.subPanner.pan;

        this.noisePanner = context.createStereoPanner();
        this.noise.connect(this.noisePanner);
        this.noisePanner.connect(this.vcaNode);
        this.noise.pan = this.noisePanner.pan;

        this.oscPanner = context.createStereoPanner();
        this.oscillator.connect(this.oscPanner);
        this.oscPanner.connect(this.vcaNode);
        this.oscillator.pan = this.oscPanner.pan;

    } else {
        this.sub.connect(this.vcaNode);
        this.oscillator.connect(this.vcaNode);
        this.noise.connect(this.vcaNode);
    }
    //    this.lfo[1].connect(this.oscillator.pan);
    //    this.envelope[0].connect(this.vca);
    //    this.envelope[1].connect(this.oscillator.detune);

    var getHandler = function (module, parameter) {
        var result;
        switch (parameter) {
        case "waveform":
            result = function (evt) {
                that[module].setWaveform(evt.detail);
            };
            break;
        case "wrapper":
            result = function (evt) {
                that[module].setWrapper(evt.detail);
            };
            break;
        case "resonanceActive":
            result = function (evt) {
                that[module].resonanceActive = evt.detail;
            };
            break;
        case "env0data":
        case "env1data":
            result = function (evt) {
                var d = evt.detail;
                switch (d.type) {
                case "add":
                    that[module].addPDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index, [d.data.x, d.data.y]);
                    break;
                case "move":
                    that[module].movePDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index, [d.data.x, d.data.y]);
                    break;
                case "delete":
                    that[module].deletePDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index);
                    break;
                }
            };
            break;
        default:
            result = function (evt) {
                that[module][parameter].setValueAtTime(evt.detail, that.context.currentTime);
            };
            break;
        }
        return result;
    };

    var eventHandlers = [{
        eventName: "oscillator.change.waveform",
        handler: getHandler("oscillator", "waveform")
    }, {
        eventName: "oscillator.change.wrapper",
        handler: getHandler("oscillator", "wrapper")
    }, {
        eventName: "oscillator.change.resonance",
        handler: getHandler("oscillator", "resonance")
    }, {
        eventName: "oscillator.change.mix",
        handler: getHandler("oscillator", "mix")
    }, {
        eventName: "oscillator.resonance.toggle",
        handler: getHandler("oscillator", "resonanceActive")
    }, {
        eventName: "oscillator.env0.change.data",
        handler: getHandler("oscillator", "env0data")
    }, {
        eventName: "oscillator.env1.change.data",
        handler: getHandler("oscillator", "env1data")
    }, {
        eventName: "noise.change.amount",
        handler: getHandler("noise", "gain")
    }, {
        eventName: "noise.toggle",
        handler: getHandler("noise", "active")
    }, {
        eventName: "sub.change.ratio",
        handler: getHandler("sub", "ratio")
    }, {
        eventName: "sub.change.amount",
        handler: getHandler("sub", "gain")
    }, {
        eventName: "sub.toggle",
        handler: getHandler("sub", "active")
    }];

    var addVoiceEventListeners = function () {
        var i, j;
        for (i = 0, j = eventHandlers.length; i < j; i += 1) {
            context.addEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
        }
    };
    var getRemoveEventFunction = function () {
        return function removeVoiceEventListeners() {
            var i, j;
            for (i = 0, j = eventHandlers.length; i < j; i += 1) {
                context.removeEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
            }
        };
    };

    this.removeVoiceEventListeners = getRemoveEventFunction();
    addVoiceEventListeners();
};
Voice.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
        this.vcaNode.connect(node.input);
    } else {
        this.vcaNode.connect(node);
    }
};
Voice.prototype.disconnect = function () {
    this.vcaNode.disconnect();
};
Voice.prototype.destroy = function () {
    this.sub.stop(this.stopTime);

    this.removeVoiceEventListeners();
    this.envelope.forEach(function (envelope) {
        envelope.disconnect();
        envelope = null;
    });
    this.lfo.forEach(function (lfo) {
        lfo.disconnect();
        lfo.destroy();
        lfo = null;
    });
    this.oscillator.destroy();
    this.oscillator = null;
    this.disconnect();
    this.vcaNode = null;
    if (typeof this.destroyCallback === 'function') {
        this.destroyCallback(this);
    }
};
Voice.prototype.start = function (time) {
    this.startTime = time;
    this.sub.start(time);
    this.lfo.forEach(function startLFO(lfo) {
        lfo.start();
    });
    this.envelope.forEach(function triggerEnvelope(envelope) {
        envelope.trigger(time);
    });
};
Voice.prototype.stop = function (time, callback) {
    this.stopTime = time;
    this.envelope.forEach(function (envelope) {
        envelope.release(time);
    });
    this.destroyCallback = callback;
    this.destroyTimer = setTimeout((function (osc) {
        return function () {
            osc.destroy();
        };
    }(this)), this.envelope[0].getReleaseDuration() * 1000 + 30);
};
Voice.prototype.getModulators = function getModulators() {
    return {
        "lfo": this.lfo,
        "envelope": this.envelope
    };
};
Voice.getModulationInputDescriptors = function (context) {
    var inputs = {
        "vca": {
            "min": 0,
            "max": 1
        },
        "submodules": {
            "sub": SubOscillator.getModulationInputDescriptors(),
            "noise": NoiseGenerator.getModulationInputDescriptors(),
            "oscillator": PDOscillator.getModulationInputDescriptors()
        }
    };
    if (typeof context.createStereoPanner === "function") {
        inputs.submodules.sub.pan = {
            "min": -1,
            "max": 1,
            "flipWhenNegative": true,
            "midValue": "center"
        };
        inputs.submodules.noise.pan = {
            "min": -1,
            "max": 1,
            "flipWhenNegative": true,
            "midValue": "center"
        };
        inputs.submodules.oscillator.pan = {
            "min": -1,
            "max": 1,
            "flipWhenNegative": true,
            "midValue": "center"
        };
    }
    return inputs;
};
module.exports = Voice;