/*global require, module, setTimeout */
"use strict";
var EnvelopeGenerator = require("./EnvelopeGenerator"),
    PDOscillator = require("./PDOscillator"),
    NoiseGenerator = require("./NoiseGenerator"),
    SubOscillator = require("./SubOscillator"),
    LFO = require("./LFO"),
    Voice;

Voice = function (context, patch, frequency, options) {
    var key,
        i, j,
        that = this,
        createVoiceLfo,
        getHandler,
        eventHandlers,
        addVoiceEventListeners,
        getRemoveEventFunction;

    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                this[key] = options[key];
            }
        }
    }
    this.context = context;
    this.vca = context.createGain();
    this.vca.gain.value = 1;
    this.envelope = [];
    this.lfo = [];

    createVoiceLfo = function (lfoPatch, index) {
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
        this.subPanner.connect(this.vca);
        this.sub.pan = this.subPanner.pan;

        this.noisePanner = context.createStereoPanner();
        this.noise.connect(this.noisePanner);
        this.noisePanner.connect(this.vca);
        this.noise.pan = this.noisePanner.pan;

        this.oscPanner = context.createStereoPanner();
        this.oscillator.connect(this.oscPanner);
        this.oscPanner.connect(this.vca);
        this.oscillator.pan = this.oscPanner.pan;

    } else {
        this.sub.connect(this.vca);
        this.oscillator.connect(this.vca);
        this.noise.connect(this.vca);
    }

    getHandler = function (module, parameter) {
        var result;
        switch (parameter) {
        case "waveform":
            result = function (evt) {
                var value = evt.detail.value || evt.detail;
                that[module].setWaveform(value);
            };
            break;
        case "wrapper":
            result = function (evt) {
                var value = evt.detail.value || evt.detail;
                that[module].setWrapper(value);
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

    eventHandlers = [{
        eventName: "oscillator.change.waveform",
        handler: getHandler("oscillator", "waveform")
    }, {
        eventName: "oscillator.change.wrapper",
        handler: getHandler("oscillator", "wrapper")
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
        eventName: "noise.toggle",
        handler: getHandler("noise", "active")
    }, {
        eventName: "sub.change.ratio",
        handler: getHandler("sub", "ratio")
    }, {
        eventName: "sub.toggle",
        handler: getHandler("sub", "active")
    }];

    addVoiceEventListeners = function () {
        var i, j;
        for (i = 0, j = eventHandlers.length; i < j; i += 1) {
            context.addEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
        }
    };
    getRemoveEventFunction = function () {
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
        this.vca.connect(node.input);
    } else {
        this.vca.connect(node);
    }
};
Voice.prototype.disconnect = function () {
    this.vca.disconnect();
};
Voice.prototype.destroy = function () {
    this.sub.stop(this.stopTime);
    this.sub.disconnect();
    this.sub.destroy();
    this.noise.stop();
    this.noise.disconnect();
    this.noise.destroy();

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
    this.vca = null;
    if (typeof this.destroyCallback === 'function') {
        this.destroyCallback(this);
    }
};
Voice.prototype.start = function (time) {
    this.startTime = time;
    this.sub.start(time);
    this.noise.start();
    this.lfo.forEach(function startLFO(lfo) {
        if (lfo) {
            lfo.start();
        }
    });
    this.envelope.forEach(function triggerEnvelope(envelope) {
        if (envelope) {
            envelope.trigger(time);
        }
    });
};
Voice.prototype.stop = function (time, callback) {
    this.stopTime = time;
    this.envelope.forEach(function (envelope) {
        envelope.release(time);
    });
    this.destroyCallback = callback;
    this.destroyTimer = setTimeout(this.destroy.bind(this), this.envelope[0].getReleaseDuration() * 1000);
};
Voice.prototype.setFrequency = function setFrequency(frequency) {
    this.oscillator.frequency.gain.setValueAtTime(frequency, this.context.currentTime);
    this.sub.frequency.setValueAtTime(frequency, this.context.currentTime);
};
Voice.prototype.getLocalModulators = function getLocalModulators() {
    return {
        "lfo": this.lfo,
        "envelope": this.envelope
    };
};
Voice.prototype.getEnvelopeTargets = function getEnvelopeTargets() {
    var targets = {
        "vca.gain": this.vca.gain,
        "noise.gain": this.noise.gain,
        "sub.gain": this.sub.gain,
        "oscillator.resonance": this.oscillator.resonance.gain,
        "oscillator.mix": this.oscillator.mix.gain,
        "oscillator.detune": this.oscillator.detune
    };
    if (typeof this.context.createStereoPanner === "function") {
        targets["oscillator.pan"] = this.oscillator.pan;
        targets["sub.pan"] = this.sub.pan;
        targets["noise.pan"] = this.noise.pan;
    }
    return targets;
};

module.exports = Voice;