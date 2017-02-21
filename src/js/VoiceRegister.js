import Tunings from "./Tunings";
import Voice from "./Voice";

/**
 *  class VoiceRegister
 *  handles mapping from keypresses to voices, via tuning
 *
 **/

class VoiceRegister {

    constructor (store, context, modulationMatrix) {
        this.stateChangeHandler = this.stateChangeHandler.bind(this);

        this.store = store;
        this.state = this.store.getState();
        this.activeKeys = [...this.state.playState.keys];
        this.context = context;

        this.tunings = {
            "tempered": Tunings.getTemperedScale(0, 120, 69, 440),
            "tempered6": Tunings.getTemperedScale(0, 120, 69, 440, 5),
            "tempered12_1_5": Tunings.getTemperedScale(0, 120, 69, 440, 12, 1.5),
            "pythagorean": Tunings.getPythagoreanScale(0, 120, 69, 440),
            "erik": Tunings.getExperimentalScale(0, 120, 69, 440),
            "halvannen": Tunings.getHalvannenScale(0, 120, 69, 440)
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

    startVoice (key, freq) {
        if (!this.activeVoices[key]) {
            const frequency = (typeof key === "number") ? this.tuning[key] : freq;
            const voice = new Voice(this.context, this.store, frequency);

            if (this.totalVoicesCount === 0) {
                this.modulationMatrix.startGlobalModulators();
            }
            this.modulationMatrix.patchVoice(voice, this.patch);

            voice.connect(this.mainMix);
            this.activeVoices[key] = voice;
            this.activeKeys[key] = true;

            voice.start(this.context.currentTime);
        }
    }

    get totalVoicesCount () {
        const activeCount = this.activeVoices.reduce((prev, curr) => {return (curr ? (prev + 1) : prev);}, 0);
        const stoppedCount = this.stoppedVoices.reduce((prev, curr) => {return (curr ? (prev + 1) : prev);}, 0);

        return activeCount + stoppedCount;
    }

    stopVoice (key) {
        const voice = this.activeVoices[key];

        if (voice) {

            voice.stop(this.context.currentTime, this.deleteVoice.bind(this));
            if (this.stoppedVoices[key]) {
                this.deleteVoice(this.stoppedVoices[key]);
            }

            this.stoppedVoices[key] = voice;
            delete this.activeVoices[key];
            delete this.activeKeys[key];
        }

    }

    deleteVoice (voice) {
        const notVoice = (v) => v === null;
        let voiceIndex = this.stoppedVoices.indexOf(voice);

        if (voiceIndex !== -1) {
            delete this.stoppedVoices[voiceIndex];

        } else {

            voiceIndex = this.activeVoices.indexOf(voice);

            if (voiceIndex !== -1) {
                delete this.activeVoices[voiceIndex];
            }
        }

        //    this.modulationMatrix.unpatchVoice(voice);

        if (this.totalVoicesCount === 0) {
            this.modulationMatrix.stopGlobalModulators();
        }
    }

    stateChangeHandler () {
        const newState = this.store.getState();
        const newKeyState = newState.playState.keys;
        const newTuningState = newState.settings.tuning;

        if (this.activeKeys !== newKeyState) {

            const reduceDownKeys = (prev, current, index) => {
                if (current && current.down && !this.activeKeys[index]) {
                    return [...prev, index];
                }
                return prev;
            };

            const reduceUpKeys = (prev, current, index) => {
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

        if (newTuningState.baseFrequency.value !== this.baseFrequency) {

            this.baseFrequency = newTuningState.baseFrequency.value;
            this.tuning = Tunings.getTemperedScale(0, 120, 69, this.baseFrequency);

            this.activeVoices.forEach((v, i) => {
                v.frequency = this.tuning[i];
            });
        }
    }

    /*
    appKeyDownHandler (event) {
        if (chords.length === 1) {
            // add tones to initial chord after chordShift is enabled
            this.startTone(k);
        }
    }
    */

    set chordShift (value) {
        const chords = this.chordShifter.chords;
        const keys = [];

        if (this.chordShifter.enabled) {

            const q = value * (chords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = q - chordIndex;

            const indexReducer = (acc, curr, index) => curr ? [...acc, index] : acc;

            const voiceIndexes = this.activeVoices.reduce(indexReducer);

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
                    // console.log("voice " + i + ": \n freq1: " + frequency1 + "\tfreq2:\t" + frequency2 + "\tresult:\t" + frequency);
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
        }
    }

    set chordShiftMode (mode) {

    }

    pitchBendHandler () {
        // console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    }
}


export default VoiceRegister;
