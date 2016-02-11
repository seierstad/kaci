/*global require, module, document */

"use strict";
var Tunings = require("./Tunings"),
    Voice = require("./Voice"),
    VoiceRegister;

VoiceRegister = function (context, patchHandler, modulationMatrix) {
    var appKeyDownHandler,
        appKeyUpHandler,
        chordShiftHandler,
        activateChordShiftHandler,
        deactivateChordShiftHandler,
        getIndexes;

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
    this.chordShifter = {
        active: false,
        chords: [],
        activeKeys: []
    };

    this.mainMix = context.createGain();
    this.mainMix.connect(context.destination);

    this.modulationMatrix = modulationMatrix;

    this.tuning = this.tunings.tempered;

    getIndexes = function getIndexes(keyarray) {
        return keyarray.map(function (value, index, arr) {
            if (value !== null && value !== undefined) return index;
        }).filter(function (value) {
            return value !== undefined
        });
    };

    appKeyDownHandler = function appKeyDownHandler(event) {
        var k = event.detail.keyNumber,
            lastChord,
            chords = this.chordShifter.chords;

        if (!this.chordShifter.active) {
            this.startTone(k);
        } else {
            if (this.chordShifter.activeKeys.length === 0) {
                // first pressed key -> start new chord
                chords.push([k]);
            } else {
                lastChord = chords[chords.length - 1];
                if (lastChord.indexOf(k) === -1) {
                    // add key to last chord
                    lastChord.push(k);
                    lastChord.sort(function (a, b) {
                        return a < b ? -1 : 1;
                    });
                }
            }
            this.chordShifter.activeKeys.push(k);
            if (chords.length === 1) {
                // add tones to initial chord after chordShift is activated
                this.startTone(k);
            }
        }
    };

    appKeyUpHandler = function appKeyUpHandler(event) {
        var k = event.detail.keyNumber,
            activeIndex;
        if (!this.chordShifter.active) {
            this.stopTone(k);
        } else {
            // register key as released in chordShifter
            activeIndex = this.chordShifter.activeKeys.indexOf(k);
            if (activeIndex !== -1) {
                this.chordShifter.activeKeys.splice(activeIndex, 1);
            }
        }
    };

    activateChordShiftHandler = function activateChordShiftHandler(event) {
        // activate
        this.chordShifter.active = true;

        // add current chord (if any)
        var activeKeys = getIndexes(this.activeVoices);
        if (activeKeys.length > 0) {
            this.chordShifter.chords.push(activeKeys);
            this.chordShifter.activeKeys = activeKeys.slice();
        } else {
            this.chordShifter.activeKeys = [];
        }
    };

    deactivateChordShiftHandler = function activateChordShiftHandler(event) {
        this.chordShifter = {
            active: false,
            chords: [],
            activeKeys: []
        };
        // TODO: handle held keys/active voices

    };

    chordShiftHandler = function chordShiftHandler(event) {
        var value = event.detail.value,
            i,
            j,
            voice,
            voiceIndexes,
            chordIndex,
            chordRatio,
            key1,
            key2,
            keys = [],
            frequency1,
            frequency2,
            q,
            frequency,
            chords = this.chordShifter.chords;

        if (this.chordShifter.active) {

            q = value * (chords.length - 1);
            chordIndex = Math.floor(q);
            chordRatio = q - chordIndex;

            voiceIndexes = getIndexes(this.activeVoices);

            // console.log("chord index: " + chordIndex + "\tchord1:\t" + chords[chordIndex].length + "\tchord2:\t" + chords[chordIndex + 1].length + " ratio: " + chordRatio);
            for (i = 0, j = voiceIndexes.length; i < j; i += 1) {
                voice = this.activeVoices[voiceIndexes[i]];
                key1 = chords[chordIndex][i];

                /* contious shift between frequencies: */
                frequency1 = this.tuning[key1];
                if (chordIndex === chords.length - 1) {
                    // handle edge case
                    frequency = frequency1;
                } else {
                    key2 = chords[chordIndex + 1][i];
                    frequency2 = this.tuning[key2];
                    frequency = frequency1 * Math.pow(frequency2 / frequency1, chordRatio);
                    keys.push({
                        "from": key1,
                        "to": key2
                    });
                    // emit event to update view...
                    console.log("voice " + i + ": \n freq1: " + frequency1 + "\tfreq2:\t" + frequency2 + "\tresult:\t" + frequency);
                }

                /* end continous shift */

                /* stepwise (semitone, glissando) shift between frequencies: */
                /*
                function getKey(value, key1, key2) {
                    var diff = key2 - key1;

                    if (diff < 0) {
                        return key1 + Math.ceil(value * (diff - 1));
                    } else {
                        return key1 + Math.floor(value * (diff + 1));
                    }
                }

                key1 = chords[chordIndex][i];
                key2 = chords[chordIndex + 1][i];


                frequency = this.tuning[getKey(chordRatio, key1, key2)];
*/
                /* end stepwise shift */

                if (!isNaN(frequency)) {
                    voice.setFrequency(frequency);
                }
            }
            context.dispatchEvent(new CustomEvent("chordShift.changed", {
                "detail": {
                    "keys": keys,
                    "balance": chordRatio,
                    "fromIndex": chordIndex
                }
            }));
        }
    };

    var pitchBendHandler = function (event) {
        console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    };
    var modulationWheelHandler = function (event) {
        console.log("MODWHEEL coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    };
    context.addEventListener("keyboard.keydown", appKeyDownHandler.bind(this));
    context.addEventListener("keyboard.keyup", appKeyUpHandler.bind(this));
    context.addEventListener("chordShift.activate", activateChordShiftHandler.bind(this));
    context.addEventListener("chordShift.deactivate", deactivateChordShiftHandler.bind(this));
    context.addEventListener("chordShift.change", chordShiftHandler.bind(this));
    context.addEventListener("pitchBend.change", pitchBendHandler.bind(this));
    context.addEventListener("modulationWheel.change", modulationWheelHandler.bind(this));
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