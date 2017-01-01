import Tunings from "./Tunings";
import Voice from "./Voice";
import DCGenerator from "./DCGenerator";

/**
 *  class VoiceRegister
 *  handles mapping from keypresses to voices, via tuning
 *
 **/

class VoiceRegister {
    constructor(store, context, modulationMatrix) {
        this.appKeyDownHandler = this.appKeyDownHandler.bind(this);
        this.appKeyUpHandler = this.appKeyUpHandler.bind(this);
        this.chordShiftHandler = this.chordShiftHandler.bind(this);
        this.enableChordShiftHandler = this.enableChordShiftHandler.bind(this);
        this.disableChordShiftHandler = this.disableChordShiftHandler.bind(this);
        this.getIndexes = this.getIndexes.bind(this);
        this.stateChangeHandler = this.stateChangeHandler.bind(this);


        this.store = store;
        this.state = this.store.getState();
        this.activeKeys = [...this.state.playState.keys];
        this.context = context;

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
        this.stateChangeHandler();
        this.store.subscribe(this.stateChangeHandler);
    }

    stateChangeHandler() {
        const newState = this.store.getState();
        const newKeyState = newState.playState.keys;
        if (this.activeKeys !== newKeyState) {

            const reduceDownKeys = (prev, current, index) => {
                if (current && current.down && !this.activeKeys[index]) {
                    return [...prev, index];
                }
                return prev;
            };

            const reduceUpKeys = function (prev, current, index) {
                if (!!current && (!newKeyState[index] || !newKeyState[index].down)) {
                    return [...prev, index];
                }
                return prev;
            };

            const downs = newKeyState.reduce(reduceDownKeys, []);
            const ups = this.activeKeys.reduce(reduceUpKeys, []);

            ups.forEach(k => this.stopVoice(k));
            downs.forEach(k => this.startVoice(k));

        }
    }

    getIndexes(keyarray) {
        return keyarray.map(function (value, index) {
            if (value !== null && value !== undefined) return index;
        }).filter(function (value) {
            return value !== undefined;
        });
    }

    appKeyDownHandler(event) {
        var k = event.detail.keyNumber,
            lastChord,
            chords = this.chordShifter.chords;

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
    }

    appKeyUpHandler(event) {
        var k = event.detail.keyNumber,
            activeIndex;
        if (!this.chordShifter.enabled) {
            this.stopTone(k);
        } else {
            // register key as released in chordShifter
            const activeIndex = this.chordShifter.activeKeys.indexOf(k);
            if (activeIndex !== -1) {
                this.chordShifter.activeKeys.splice(activeIndex, 1);
            }
        }
    }

    enableChordShiftHandler(event) {
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
    }

    disableChordShiftHandler(event) {
        this.chordShifter = {
            enabled: false,
            chords: [],
            activeKeys: []
        };
        // TODO: handle held keys/active voices

        context.dispatchEvent(new CustomEvent("chordShift.disabled", {
            "detail": {}
        }));
    }

    chordShiftHandler(event) {
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
    }

    pitchBendHandler(event) {
        console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    }

    modulationWheelHandler(event) {
        console.log("MODWHEEL coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    }

    startVoice(key, freq) {
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
            patch = this.store.getState().patch;

            voice = new Voice(this.context, this.store, frequency);

            this.modulationMatrix.patchVoice(voice);
            voice.connect(this.mainMix);
            this.activeVoices[key] = voice;
            this.activeKeys[key] = true;

            voice.start(this.context.currentTime);

        }
    }

    stopVoice(key) {
        var voice = this.activeVoices[key];

        if (voice) {

            voice.stop(this.context.currentTime, this.deleteVoice.bind(this));
            if (this.stoppedVoices[key]) {
                this.deleteVoice(this.stoppedVoices[key]);
            }

            this.stoppedVoices[key] = voice;
            this.activeVoices[key] = null;
            this.activeKeys[key] = null;

            this.context.dispatchEvent(new CustomEvent("voice.ended", {
                "detail": {
                    "keyNumber": key
                }
            }));
        }
    }

    deleteVoice(voice) {
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
    }
}


export default VoiceRegister;
