/*global require, module, document */

"use strict";
var Tunings = require("./Tunings"),
    Voice = require("./Voice"),
    VoiceRegister;

VoiceRegister = function (context, patchHandler, modulationMatrix) {
    var appKeyDownHandler,
        appKeyUpHandler;

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
    this.activeVoices = [];
    this.stoppedVoices = [];

    this.mainMix = context.createGain();
    this.mainMix.connect(context.destination);

    this.modulationMatrix = modulationMatrix;

    this.tuning = this.tunings.tempered;


    appKeyDownHandler = function appKeyDownHandler(event) {
        this.startTone(event.detail.keyNumber);
    };

    appKeyUpHandler = function appKeyUpHandler(event) {
        this.stopTone(event.detail.keyNumber);
    };
    context.addEventListener("keyboard.keydown", appKeyDownHandler.bind(this));
    context.addEventListener("keyboard.keyup", appKeyUpHandler.bind(this));

};

VoiceRegister.prototype.deleteVoice = function (voice) {
    var voiceIndex,
        notVoice;

    voiceIndex = this.stoppedVoices.indexOf(voice);
    if (voiceIndex !== -1) {
        this.stoppedVoices[voiceIndex] = null;
    } else {
        voiceIndex = this.activeVoices.indexOf(voice);
        if (voiceIndex !== -1) {
            this.activeVoices[voiceIndex] = null;
        }
    }
//    this.modulationMatrix.unpatchVoice(voice);
    voice = null;
    notVoice = function (v) {
        return v === null;
    };

    if (this.activeVoices.every(notVoice) && this.stoppedVoices.every(notVoice)) {
        // no active voices -> stop global lfos
        this.context.dispatchEvent(new CustomEvent("voice.last.ended", {}));
    }

};

VoiceRegister.prototype.stopTone = function (key) {
    var voice = this.activeVoices[key];

    if (voice) {

        voice.stop(this.context.currentTime, this.deleteVoice.bind(this));
        if (this.stoppedVoices[key]) {
            this.deleteVoice(this.stoppedVoices[key]);
        }

        this.stoppedVoices[key] = voice;
        this.activeVoices[key] = null;

        this.context.dispatchEvent(new CustomEvent("voice.ended", {
            "detail": {
                "keyNumber": key
            }
        }));
    }
};

VoiceRegister.prototype.startTone = function (key, freq) {
    var frequency,
        patch,
        voice,
        notVoice = function (v) {
            return v === null;
        };

    if (this.activeVoices.every(notVoice)) {
        this.context.dispatchEvent(new CustomEvent("voice.first.started", {}));
    }
    if (!this.activeVoices[key]) {
        frequency = (typeof key === "number") ? this.tuning[key] : freq;
        patch = this.patchHandler.getActivePatch();

        voice = new Voice(this.context, patch, frequency);

        this.modulationMatrix.patchVoice(voice, patch);
        voice.connect(this.mainMix);
        this.activeVoices[key] = voice;

        voice.start(this.context.currentTime);

        this.context.dispatchEvent(new CustomEvent("voice.started", {
            "detail": {
                "keyNumber": key
            }
        }));
    }
};
module.exports = VoiceRegister;