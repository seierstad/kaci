import Tunings from "./Tunings";
import Voice from "./Voice";

const VoiceRegister = function (context, patchHandler, modulationMatrix, store) {
    let appKeyDownHandler,
        appKeyUpHandler,
        chordShiftHandler,
        disableChordShiftHandler,
        enableChordShiftHandler,
        getIndexes;

    this.store = store;
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
        enabled: false,
        chords: [],
        activeKeys: []
    };

    this.mainMix = context.createGain();
    this.mainMix.connect(context.destination);

    this.modulationMatrix = modulationMatrix;

    this.tuning = this.tunings.tempered;

    getIndexes = function getIndexes (keyarray) {
        return keyarray.map(function (value, index) {
            if (value !== null && value !== undefined) {
                return index;
            }
        }).filter(function (value) {
            return value !== undefined;
        });
    };

    appKeyDownHandler = function appKeyDownHandler (event) {
        const k = event.detail.keyNumber;
        const chords = this.chordShifter.chords;

        if (!this.chordShifter.enabled) {
            this.startTone(k);
        } else {
            if (this.chordShifter.activeKeys.length === 0) {
                // first pressed key -> start new chord
                chords.push([k]);
                console.log("starting chord " + chords.length);
            } else {
                const lastChord = chords[chords.length - 1];
                if (lastChord.indexOf(k) === -1) {
                    // add key to last chord
                    lastChord.push(k);
                    lastChord.sort(function (a, b) {
                        return a < b ? -1 : 1;
                    });
                    console.log("added note " + lastChord.length + " to chord " + chords.length);
                }
            }
            this.chordShifter.activeKeys.push(k);
            if (chords.length === 1) {
                // add tones to initial chord after chordShift is enabled
                this.startTone(k);
            }
        }
    };

    appKeyUpHandler = function appKeyUpHandler (event) {
        const k = event.detail.keyNumber;

        if (!this.chordShifter.enabled) {
            this.stopTone(k);
        } else {
            // register key as released in chordShifter
            const activeIndex = this.chordShifter.activeKeys.indexOf(k);
            if (activeIndex !== -1) {
                this.chordShifter.activeKeys.splice(activeIndex, 1);
            }
        }
    };

    enableChordShiftHandler = function enableChordShiftHandler () {
        // enable
        this.chordShifter.enabled = true;

        // add current chord (if any)
        const activeKeys = getIndexes(this.activeVoices);
        if (activeKeys.length > 0) {
            this.chordShifter.chords.push(activeKeys);
            this.chordShifter.activeKeys = activeKeys.slice();
        } else {
            this.chordShifter.activeKeys = [];
        }
        context.dispatchEvent(new CustomEvent("chordShift.enabled", {
            "detail": {}
        }));
    };

    disableChordShiftHandler = function disableChordShiftHandler () {
        this.chordShifter = {
            enabled: false,
            chords: [],
            activeKeys: []
        };
        // TODO: handle held keys/active voices

        context.dispatchEvent(new CustomEvent("chordShift.disabled", {
            "detail": {}
        }));
    };

    chordShiftHandler = function chordShiftHandler (event) {
        const chords = this.chordShifter.chords;
        const keys = [];
        const value = event.detail.value;

        if (this.chordShifter.enabled) {

            const q = value * (chords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = q - chordIndex;

            const voiceIndexes = getIndexes(this.activeVoices);

            // console.log("chord index: " + chordIndex + "\tchord1:\t" + chords[chordIndex].length + "\tchord2:\t" + chords[chordIndex + 1].length + " ratio: " + chordRatio);
            for (let i = 0, j = voiceIndexes.length; i < j; i += 1) {
                const voice = this.activeVoices[voiceIndexes[i]];
                const key1 = chords[chordIndex][i];
                let frequency;

                /* contious shift between frequencies: */
                const frequency1 = this.tuning[key1];
                if (chordIndex === chords.length - 1) {
                    // handle edge case
                    frequency = frequency1;
                } else {
                    const key2 = chords[chordIndex + 1][i];
                    const frequency2 = this.tuning[key2];
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
                function getKey (value, key1, key2) {
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

    const pitchBendHandler = function (event) {
        console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    };
    const modulationWheelHandler = function (event) {
        console.log("MODWHEEL coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    };
    context.addEventListener("keyboard.keydown", appKeyDownHandler.bind(this));
    context.addEventListener("keyboard.keyup", appKeyUpHandler.bind(this));
    context.addEventListener("chordShift.enable", enableChordShiftHandler.bind(this));
    context.addEventListener("chordShift.disable", disableChordShiftHandler.bind(this));
    context.addEventListener("chordShift.change", chordShiftHandler.bind(this));
    context.addEventListener("pitchBend.change", pitchBendHandler.bind(this));
    context.addEventListener("modulationWheel.change", modulationWheelHandler.bind(this));
};

VoiceRegister.prototype.deleteVoice = function (voice) {
    let voiceIndex = this.stoppedVoices.indexOf(voice);
    if (voiceIndex !== -1) {
        this.stoppedVoices[voiceIndex] = null;
    } else {
        voiceIndex = this.activeVoices.indexOf(voice);
        if (voiceIndex !== -1) {
            this.activeVoices[voiceIndex] = null;
        }
    }
    //    this.modulationMatrix.unpatchVoice(voice);
    const notVoice = function (v) {
        return v === null;
    };

    if (this.activeVoices.every(notVoice) && this.stoppedVoices.every(notVoice)) {
        // no active voices -> stop global lfos
        this.context.dispatchEvent(new CustomEvent("voice.last.ended", {}));
    }
};

VoiceRegister.prototype.stopTone = function (key) {
    const voice = this.activeVoices[key];

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
    const notVoice = function (v) {
        return v === null;
    };

    if (this.activeVoices.every(notVoice)) {
        this.context.dispatchEvent(new CustomEvent("voice.first.started", {}));
    }
    if (!this.activeVoices[key]) {
        const frequency = (typeof key === "number") ? this.tuning[key] : freq;
        const patch = this.patchHandler.getActivePatch();

        const voice = new Voice(this.context, patch, frequency, null, this.store);

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