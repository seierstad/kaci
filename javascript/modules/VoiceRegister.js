/*global require, module, document */

"use strict";
var Tunings = require("./Tunings");
var Voice = require("./Voice");

var VoiceRegister = function (context, patchHandler, modulationMatrix) {

    this.context = context;
    this.patchHandler = patchHandler;
    this.tunings = {
        "tempered": Tunings.getTemperedScale(0, 120, 57, 220),
        "tempered6": Tunings.getTemperedScale(0, 120, 57, 220, 5),
        "tempered12_1_5": Tunings.getTemperedScale(0, 120, 57, 220, 12, 1.5),
        "pythagorean": Tunings.getPythagoreanScale(0, 120, 57, 220),
        "erik": Tunings.getExperimentalScale(0, 120, 57, 220),
        "halvannen": Tunings.getHalvannenScale(0, 120, 57, 220)
    };
    this.voices = [];

    this.mainMix = context.createChannelMerger();
    this.mainMix.connect(context.destination);
    this.modulationMatrix = modulationMatrix;

    this.tuning = this.tunings.tempered;


    var appKeyDownHandler = function appKeyDownHandler(event) {
        this.startTone(event.detail.keyNumber);
    };
    var appKeyUpHandler = function appKeyUpHandler(event) {
        this.stopTone(event.detail.keyNumber);
    };
    context.addEventListener("keyboard.keydown", appKeyDownHandler.bind(this));
    context.addEventListener("keyboard.keyup", appKeyUpHandler.bind(this));

};

VoiceRegister.prototype.deleteVoice = function (voice) {
    //        modulationMatrix.unpatch(voice);

    //    this.globalModulators.lfo[0].outputs.oscillatorDetune.disconnect(voice.detune);
    //    this.globalModulators.lfo[1].outputs.pdMix.disconnect(voice.mix);
    var voiceIndex = this.voices.indexOf(voice);
    if (voiceIndex !== -1) {
        this.voices[voiceIndex] = null;
    }
    voice = null;
    var notVoice = function (v) {
        return v === null;
    };

    if (this.voices.every(notVoice)) {
        // no active voices -> stop global lfos
        this.context.dispatchEvent(new CustomEvent("voice.last.ended", {}));
    }

};

VoiceRegister.prototype.stopTone = function (key) {
    var voice = this.voices[key];
    if (voice) {
        voice.stop(this.context.currentTime, this.deleteVoice.bind(this));
        this.context.dispatchEvent(new CustomEvent("voice.ended", {
            "detail": {
                "keyNumber": key
            }
        }));
    }
};

VoiceRegister.prototype.startTone = function (key, freq) {
    var frequency = (typeof key === "number") ? this.tuning[key] : freq;
    var patch = this.patchHandler.getActivePatch();
    var voice = new Voice(this.context, patch, frequency);
    voice.connect(this.mainMix);

    this.modulationMatrix.patch(voice, patch.modulation);

    //    this.globalModulators.lfo[0].outputs.oscillatorDetune.connect(voice.oscillator.detune);
    //    this.globalModulators.lfo[1].outputs.pdMix.connect(voice.oscillator.pan);
    //    this.globalModulators.lfo[2].outputs.pdMix.connect(voice.noise.pan);
    //    this.globalModulators.lfo[2].outputs.oscillatorDetune.connect(voice.oscillator.detune);


    var notVoice = function (v) {
        return v === null;
    };
    if (this.voices.every(notVoice)) {
        this.context.dispatchEvent(new CustomEvent("voice.first.started", {}));
    }

    voice.start(this.context.currentTime);
    this.voices[key] = voice;

    this.context.dispatchEvent(new CustomEvent("voice.started", {
        "detail": {
            "keyNumber": key
        }
    }));
};
module.exports = VoiceRegister;