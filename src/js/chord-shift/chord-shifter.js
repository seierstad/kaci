import autobind from "autobind-decorator";

import KaciNode from "../kaci-node";
import {inputNode} from "../shared-functions";
import {BUFFER_LENGTH} from "../constants";
import {sortKeysByNumber} from "../VoiceRegister";


function getKey (value, key1, key2) {
    const diff = key2.number - key1.number;

    if (diff < 0) {
        return key1.number + Math.ceil(value * (diff - 1));
    }

    return key1.number + Math.floor(value * (diff + 1));
}

/**
 *  class ChordShifter
 *  handles manipulation of frequencies
 *
 **/


class ChordShifter extends KaciNode {

    constructor (...args) {
        super(...args);
        const [context, store, scale] = args;

        this.store = store;
        const state = this.store.getState();
        const {
            patch: {
                chordshift: patchState = {}
            },
            playState: {
                chordShift: playState = {}
            } = {}
        } = state;

        this.storedPatchState = patchState;
        this.storedPlayState = playState;

        this.state = {
            ...playState,
            ...patchState
        };
        this.scale = scale;
        this.mode = patchState.mode || "portamento";
        this.processor = null;
        this.outputNode = null;

        this.parameters = {
            "value": inputNode(context)
        };

        this.store.subscribe(this.stateChangeHandler);
        this.outputs = [];
        this.samples = 0;
        this.sortedChords = [];
        this.previousInput = null;
        this.previousSortedChords = [];
        this.previousOutputs = [];
    }

    @autobind
    audioProcessHandler (event) {
        const inputData = event.inputBuffer.getChannelData(0);

        const outputChannelCount = event.outputBuffer.numberOfChannels;
        const outputs = [];

        for (let channelIndex = 0; channelIndex < outputChannelCount; channelIndex += 1) {
            outputs.push(event.outputBuffer.getChannelData(channelIndex));
        }

        const bufferLength = outputs[0].length;

        for (let i = 0; i < bufferLength; i += 1) {
            if (
                inputData[i] === this.previousInput
                && this.sortedChords === this.previousSortedChords
                && this.mode === this.previousMode
            ) {

                // input value and chords are the same as previous sample -> copy previous output values
                outputs.forEach((output, index) => output[i] = this.previousOutputs[index]);

            } else {
                const q = inputData[i] * (this.sortedChords.length - 1);
                const chordIndex = Math.floor(q);
                const chordRatio = q - chordIndex;

                const isLastChord = (chordIndex === this.sortedChords.length - 1);

                const chord1 = this.sortedChords[chordIndex];
                const chord2 = isLastChord ? null : this.sortedChords[chordIndex + 1];

                outputs.forEach((output, index) => {
                    const key1 = chord1[index];

                    if (!isLastChord) {
                        const key2 = chord2[index];

                        switch (this.mode) {

                            case "portamento": {
                                /* contious shift between frequencies: */
                                const frequency1 = this.scale[key1.number];
                                const frequency2 = this.scale[key2.number];
                                output[i] = frequency1 * Math.pow(frequency2 / frequency1, chordRatio);
                                /* end continous shift */
                                break;
                            }
                            case "glissando":
                                /* stepwise (semitone, glissando) shift between frequencies: */
                                output[i] = this.scale[getKey(chordRatio, key1, key2)];
                                /* end stepwise shift */
                                break;
                        }
                    } else {
                        output[i] = this.scale[key1.number];
                    }

                    this.previousOutputs[index] = output[i];

                    //output[i] = 440 + (voiceIndex * 100) + (inputData[i] * 500);
                }, this);
            }

            if (this.sortedChords !== this.previousSortedChords) {
                this.previousSortedChords = this.sortedChords;
            }

            if (this.mode !== this.previousMode) {
                this.previousMode = this.mode;
            }

            this.previousInput = inputData[i];
        }
    }

    @autobind
    enable () {
        const {
            playState: {
                chordShift: {
                    chords = []
                } = {}
            } = {}
        } = this.store.getState();

        if (chords.length > 0) {
            this.chords = chords;
            const numberOfVoices = Object.keys(chords[0]).length;
            this.processor = this.context.createScriptProcessor(BUFFER_LENGTH, 1, numberOfVoices);
            this.parameters.value.connect(this.processor);
            this.processor.addEventListener("audioprocess", this.audioProcessHandler);
            this.outputNode = this.context.createChannelSplitter(numberOfVoices);
            this.processor.connect(this.outputNode);

        }
    }

    @autobind
    disable () {
        if (this.processor !== null) {
            this.processor.removeEventListener("audioprocess");

            this.parameters.value.disconnect();
            this.processor.disconnect();
            this.outputNode.disconnect();

            this.processor = null;
            this.outputNode = null;
            this.previousInput = null;
            this.previousOutputs = [];
        }
    }

    connect (voices = []) {
        voices.forEach((voice, index) => {
            this.outputNode.connect(voice.frequency, index);
        });
    }

    @autobind
    disconnect () {
        if (this.outputNode !== null) {
            this.outputNode.disconnect();
        }
    }

    get targets () {
        return this.parameters;
    }

    set scale (scale) {
        this.state.scale = scale;
    }

    get scale () {
        return this.state.scale;
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        const newPlayState = newState.playState.chordShift;
        if (this.storedPlayState !== newPlayState) {
            if (this.storedPlayState.chords !== newPlayState.chords) {
                this.chords = newPlayState.chords;
            }
            if (this.storedPlayState.mode !== newPlayState.mode) {
                this.mode = newPlayState.mode;
            }
            this.storedPlayState = newPlayState;
        }

        const newPatchState = newState.patch.chordshift;
        if (this.storedPatchState !== newPatchState) {
            if (this.storedPatchState.mode !== newPatchState.mode) {
                this.mode = newPatchState.mode;
            }
            this.storedPatchState = newPatchState;
        }
    }

    set chords (chords = []) {
        this.sortedChords = chords.map(chord => [...Object.values(chord).sort(sortKeysByNumber)]);
    }

    set mode (mode) {
        this.state.mode = mode;
    }

    get mode () {
        return this.state.mode;
    }
}


export default ChordShifter;
