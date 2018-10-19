import autobind from "autobind-decorator";

import {inputNode, outputNode} from "./shared-functions";

import Tunings from "./Tunings";
import Voice, {prefixKeys} from "./Voice";
import ChordShifter from "./chord-shifter";
import KaciNode from "./kaci-node";


/**
 *  class VoiceRegister
 *  handles mapping from keypresses to voices, via tuning
 *
 **/

export const sortKeysByNumber = (keyA, keyB) => {
    const numberA = parseInt(keyA.number, 10);
    const numberB = parseInt(keyB.number, 10);

    if (isNaN(numberA) || isNaN(numberB)) {
        return keyA < keyB ? -1 : 1;
    }
    return numberA < numberB ? -1 : 1;
};

class VoiceRegister extends KaciNode {

    constructor (...args) {
        super(...args);
        const [context, dc, store, modulationMatrix] = args;

        this.store = store;
        this.state = {...this.store.getState()};
        this.activeKeys = new Set(...Object.keys(this.state.playState.keys));

        this.activeVoices = {};
        this.stoppedVoices = {};
        this.frequencies = {};

        this.connections = {
            envelopes: {},
            lfos: {},
            steps: {},
            morse: {}
        }; // values set in ModulationMatrix.patchVoice

        this.lfos = [];
        this.morse = [];
        this.envelopes = [];
        this.steps = [];

        this.mainMix = context.createGain();
        this.mainMix.connect(context.destination);

        this.modulationMatrix = modulationMatrix;

        this.tuningState = {};
        this.tuning = this.state.settings.tuning;

        this.chordShiftState = this.state.playState.chordShift;
        this.chordShifter = new ChordShifter(this.context, this.dc, this.store, this.tuning);

        this.store.subscribe(this.stateChangeHandler);

        this.parameters = {
            ...(prefixKeys(this.chordShifter.targets, "chordshift."))
        };
    }

    get sources () {
        return {
            "lfos": this.lfos,
            "morse": this.morse,
            "steps": this.steps,
            "envelopes": this.envelopes
        };
    }

    get targets () {
        return this.parameters;
    }

    startVoice (key, freq) {
        if (!this.activeVoices[key]) {
            const keyNumber = parseInt(key, 10);
            const frequency = (typeof keyNumber === "number") ? this.tuning[keyNumber] : freq;
            const frequencyNode = outputNode(this.context, this.dc, frequency);
            const voice = new Voice(this.context, this.dc, this.store);

            voice.init().then(voice => {
                frequencyNode.connect(voice.frequency);

                if (this.totalVoicesCount === 0) {
                    this.modulationMatrix.startGlobalModulators();
                }
                this.modulationMatrix.patchVoice(voice, this.patch);

                voice.connect(this.mainMix);

                this.frequencies[key] = frequencyNode;
                this.activeVoices[key] = voice;
                this.activeKeys.add(key);

                voice.start(this.context.currentTime);
            });
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

                if (this.chordShifter) {
                    this.chordShifter.scale = this.scale;
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
            delete this.frequencies[stoppedVoiceKey];

        } else {

            let [activeVoiceKey = null] = Object.entries(this.activeVoices)
                .filter(([key, activeVoice]) => voice === activeVoice)
                .map(([key]) => key);

            if (activeVoiceKey !== null) {
                delete this.activeVoices[activeVoiceKey];
                delete this.frequencies[activeVoiceKey];
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

        if (this.chordShiftState !== newChordShiftState) {
            this.chordShiftState = newChordShiftState;
        }

        if (newTuningState !== this.tuningState) {

            this.tuning = newTuningState;

            this.chordShifter.tuning = this.tuning;

            Object.entries(this.activeVoices).forEach(([noteNumber, voice]) => {
                voice.frequency = this.tuning[noteNumber];
            }, this);
        }
    }

    get chordShiftState () {
        return this.state.playState.chordShift;
    }

    set chordShiftState (chordShiftState) {
        const {
            enabled,
            chords = []
        } = chordShiftState;

        if (enabled !== this.chordShiftState.enabled) {
            if (enabled) {
                this.chordShifter.enable();

                Object.values(this.frequencies).forEach((frequencyNode) => frequencyNode.disconnect());
                this.chordShifter.connect([...Object.values(this.activeVoices)]);
            } else {
                this.chordShifter.disconnect();
                Object.entries(this.frequencies).forEach(([key, frequencyNode]) => frequencyNode.connect(this.activeVoices[key].frequency));
            }
        }

        if (chords !== this.chordShiftState.chords) {
            this.chordShifter.chords = chords;
        }

        this.state.playState = {
            ...this.state.playState,
            chordShift: chordShiftState
        };
    }

    pitchBendHandler () {
        // console.log("PITCH coarse: " + event.detail.coarse + "\tfine: " + event.detail.fine + "\tMIDIvalue: " + event.detail.MIDIvalue + "\tvalue: " + event.detail.value);
    }
}


export default VoiceRegister;
