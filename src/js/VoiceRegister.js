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
        this.state = {...this.store.getState()};
        this.activeKeys = [...this.state.playState.keys];
        this.context = context;

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

        this.tuningState = {};
        this.tuning = this.state.settings.tuning;

        this.chordShift = this.state.playState.chordShift;

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

    set tuning (tuning) {
        const {selectedScale, scales, baseFrequency, keys} = tuning;
        if (this.tuningState.selectedScale !== selectedScale) {
            const scale = scales.find(s => s.name === selectedScale);
            const {min, max} = keys;
            const {value: frequency} = baseFrequency;

            if (scale) {
                const {type, baseKey} = scale;

                switch (type) {

                    case "tempered":
                        const {notes, baseNumber} = scale;
                        this.scale = Tunings.getTemperedScale(min, max, baseKey, frequency, notes, baseNumber);
                        break;

                    case "rational":
                        const {ratios} = scale;
                        this.scale = Tunings.getRationalScale(ratios)(min, max, baseKey, frequency);
                        break;
                }
            }
        }

        this.tuningState = tuning;
    }

    get tuning () {
        return this.scale;
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

    static reduceDownKeys = (keyArray) => (prev, current, index) => {
        if (current && current.down && !keyArray[index]) {
            return [...prev, index];
        }
        return prev;
    }

    static reduceUpKeys = (keyArray) => (prev, current, index) => {
        if (!!current && (!keyArray[index] || !keyArray[index].down)) {
            return [...prev, index];
        }
        return prev;
    }

    stateChangeHandler () {
        const newState = this.store.getState();
        const newKeyState = newState.playState.keys;
        const newChordShiftState = newState.playState.chordShift;
        const newTuningState = newState.settings.tuning;

        if (!(newChordShiftState && newChordShiftState.enabled)) {
            if (this.activeKeys !== newKeyState) {

                const downs = newKeyState.reduce(VoiceRegister.reduceDownKeys(this.activeKeys), []);
                const ups = this.activeKeys.reduce(VoiceRegister.reduceUpKeys(newKeyState), []);

                ups.forEach(k => this.stopVoice(k));
                downs.forEach(k => this.startVoice(k));
            }
        }

        if (this.chordShifter !== newChordShiftState) {
            this.chordShift = newChordShiftState;
        }

        if (newTuningState !== this.tuningState) {

            this.tuning = newTuningState;

            this.activeVoices.forEach((voice, noteNumber) => {
                voice.frequency = this.tuning[noteNumber];
            });
        }
    }

    static getKey (value, key1, key2) {
        const diff = key2.number - key1.number;

        if (diff < 0) {
            return key1.number + Math.ceil(value * (diff - 1));
        }

        return key1.number + Math.floor(value * (diff + 1));
    }


    set chordShift (state) {
        const {value, chords} = state;
        const keys = [];

        if (state.enabled) {

            const q = value * (chords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = q - chordIndex;

            const indexReducer = (acc, curr, index) => curr ? [...acc, index] : acc;
            const voiceIndexes = this.activeVoices.reduce(indexReducer, []);


            for (let i = 0, j = voiceIndexes.length; i < j; i += 1) {

                const voice = this.activeVoices[voiceIndexes[i]];
                const key1 = chords[chordIndex][i];
                const isLastChord = (chordIndex === chords.length - 1);

                let frequency;


                if (!isLastChord) {
                    const key2 = chords[chordIndex + 1][i];

                    if (state.mode === "portamento") {
                        /* contious shift between frequencies: */
                        const frequency1 = this.tuning[key1.number];
                        const frequency2 = this.tuning[key2.number];
                        frequency = frequency1 * Math.pow(frequency2 / frequency1, chordRatio);
                        /* end continous shift */
                    }

                    if (state.mode === "glissando") {
                        /* stepwise (semitone, glissando) shift between frequencies: */
                        frequency = this.tuning[VoiceRegister.getKey(chordRatio, key1, key2)];
                        /* end stepwise shift */
                    }

                } else {
                    frequency = this.tuning[key1.number];
                }

                if (!isNaN(frequency)) {
                    voice.frequency = frequency;
                }
            }
        }

        this.chordShifter = state;
    }

    set chordShiftMode (mode) {

    }

    pitchBendHandler () {
        // console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    }
}


export default VoiceRegister;
