import autobind from "autobind-decorator";

import {inputNode, outputNode} from "./shared-functions";
import {BUFFER_LENGTH} from "./constants";
import Tunings from "./Tunings";
import {sortKeysByNumber} from "./VoiceRegister";


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


class ChordShifter {

    constructor (store, context, scale) {

        this.store = store;
        const state = this.store.getState();
        const {
            playState: {
                chordShift: chordShiftState = {}
            } = {}
        } = state;

        this.state = {
            chordShift: chordShiftState
        };
        this.context = context;
        this.scale = scale;
        this.processor = null;
        this.outputNode = null;

        this.parameters = {
            "value": inputNode(context)
        };

        this.store.subscribe(this.stateChangeHandler);
        this.outputs = [];
        this.samples = 0;
        this.sortedChords = [];
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

                    switch (this.state.chordShift.mode) {

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

                //output[i] = 440 + (voiceIndex * 100) + (inputData[i] * 500);
            }, this);
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
            console.log(numberOfVoices);
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
        const newChordShiftState = newState.playState.chordShift;

        if (this.chordShiftState !== newChordShiftState) {
            this.chordShiftState = newChordShiftState;
        }
    }

    set chords (chords = []) {
        console.log("set chords: ", chords);
        this.sortedChords = chords.map(chord => [...Object.values(chord).sort(sortKeysByNumber)]);
    }

    set mode (mode) {

    }
}


export default ChordShifter;
