import autobind from "autobind-decorator";

import {inputNode, outputNode} from "./shared-functions";

import Tunings from "./Tunings";
import Voice from "./Voice";

/**
 *  class VoiceRegister
 *  handles mapping from keypresses to voices, via tuning
 *
 **/

const sortKeysByNumber = (keyA, keyB) => {
    const numberA = parseInt(keyA.number);
    const numberB = parseInt(keyB.number);

    if (isNaN(numberA) || isNaN(numberB)) {
        return keyA < keyB ? -1 : 1;
    }
    return numberA < numberB ? -1 : 1;
};

class VoiceRegister {

    constructor (store, context, modulationMatrix, dc) {

        this.store = store;
        this.state = {...this.store.getState()};
        this.activeKeys = new Set(...Object.keys(this.state.playState.keys));
        this.context = context;
        this.dc = dc;

        this.activeVoices = {};
        this.stoppedVoices = {};
        this.frequencies = {};

        this.chordShifter = {
            enabled: false,
            chords: [],
            activeKeys: {}
        };

        this.mainMix = context.createGain();
        this.mainMix.connect(context.destination);

        this.modulationMatrix = modulationMatrix;

        this.tuningState = {};
        this.tuning = this.state.settings.tuning;

        this.parameters = {
            "chord shift": {
                "value": inputNode(context)
            }
        };

        this.chordShift = this.state.playState.chordShift;

        this.store.subscribe(this.stateChangeHandler);
    }

    get targets () {
        return this.parameters;
    }

    startVoice (key, freq) {
        if (!this.activeVoices[key]) {
            const keyNumber = parseInt(key, 10);
            const frequency = (typeof keyNumber === "number") ? this.tuning[keyNumber] : freq;
            const frequencyNode = outputNode(this.context, this.dc, frequency);

            this.frequencies[key] = frequencyNode;

            const voice = new Voice(this.context, this.store, frequencyNode);

            if (this.totalVoicesCount === 0) {
                this.modulationMatrix.startGlobalModulators();
            }
            this.modulationMatrix.patchVoice(voice, this.patch);

            voice.connect(this.mainMix);
            this.activeVoices[key] = voice;
            this.activeKeys.add(key);

            voice.start(this.context.currentTime);
        }
    }

    set tuning (tuning) {
        const {scale, scales, baseFrequency, keys} = tuning;
        if (this.tuningState.scale !== scale || this.tuningState.baseFrequency !== baseFrequency) {
            const {min, max} = keys;
            const {value: frequency} = baseFrequency;

            if (scale) {
                const {type, baseKey} = scale;

                switch (type) {

                    case "tempered":
                        const {notes, base} = scale;
                        this.scale = Tunings.getTemperedScale(min, max, baseKey, frequency, notes, base);
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
        const activeCount = Object.keys(this.activeVoices).length;
        const stoppedCount = Object.keys(this.stoppedVoices).length;

        return activeCount + stoppedCount;
    }

    stopVoice (key) {
        const {
            [key]: voice
        } = this.activeVoices;

        if (voice) {

            voice.stop(this.context.currentTime, this.deleteVoice);
            if (this.stoppedVoices[key]) {
                this.deleteVoice(this.stoppedVoices[key]);
            }

            this.stoppedVoices[key] = voice;
            delete this.activeVoices[key];
            this.activeKeys.delete(key);
        }

    }

    @autobind
    deleteVoice (voice) {
        const notVoice = (v) => v === null;
        let [stoppedVoiceKey = null] = Object.entries(this.stoppedVoices)
            .filter(([key, stoppedVoice]) => voice === stoppedVoice)
            .map(([key]) => key);

        if (stoppedVoiceKey !== null) {
            delete this.stoppedVoices[stoppedVoiceKey];

        } else {

            let [activeVoiceKey = null] = Object.entries(this.activeVoices)
                .filter(([key, activeVoice]) => voice === activeVoice)
                .map(([key]) => key);

            if (activeVoiceKey !== null) {
                delete this.activeVoices[activeVoiceKey];
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

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();
        const newKeyState = newState.playState.keys;
        const newChordShiftState = newState.playState.chordShift;
        const newTuningState = newState.settings.tuning;

        if (!(newChordShiftState && newChordShiftState.enabled)) {
            if (this.activeKeys !== newKeyState) {

                const downs = Object.entries(newKeyState)
                    .filter(([keyNumber, keyState]) => !this.activeKeys.has(keyNumber));

                const ups = [];

                for (let keyNumber of this.activeKeys.values()) {
                    if (!(newKeyState.hasOwnProperty(keyNumber)) || !newKeyState[keyNumber].down) {
                        ups.push(keyNumber);
                    }
                }

                ups.forEach(k => this.stopVoice(k));
                downs.forEach(([keyNumber, keyState]) => this.startVoice(keyNumber, keyState.frequency));
            }
        }

        if (this.chordShifter !== newChordShiftState) {
            this.chordShift = newChordShiftState;
        }

        if (newTuningState !== this.tuningState) {

            this.tuning = newTuningState;

            Object.entries(this.activeVoices).forEach(([noteNumber, voice]) => {
                voice.frequency = this.tuning[noteNumber];
            }, this);
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
        const {
            value,
            chords,
            enabled
        } = state;

        if (enabled) {

            const q = value * (chords.length - 1);
            const chordIndex = Math.floor(q);
            const chordRatio = q - chordIndex;

            const isLastChord = (chordIndex === chords.length - 1);

            const chord1 = Object.values(chords[chordIndex]).sort(sortKeysByNumber);
            const chord2 = isLastChord ? null : Object.values(chords[chordIndex + 1]).sort(sortKeysByNumber);

            const voices = Object.entries(this.activeVoices);

            voices.forEach(([keyNumber, voice], voiceIndex) => {

                const key1 = chord1[voiceIndex];
                let frequency;


                if (!isLastChord) {
                    const key2 = chord2[voiceIndex];

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
            });
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
