import * as CHORD_SHIFT from "../chord-shift/actions";
import * as MIDI from "../midi/actions";
import * as KEYBOARD from "../keyboard/actions";
import chord from "../play-state/chord-reducer";

import {playstateDefault} from "./defaults";


const containsKey = (chord = {}, key) => {
    return chord.hasOwnProperty(key.number);
};

//const keySort = (a, b) => a.number > b.number ? -1 : 1;


const chordShift = (state = playstateDefault, action = {}, keys) => {
    const {
        keyNumber,
        type,
        value
    } = action;

    const key = {
        number: keyNumber
    };

    switch (type) {

        case MIDI.MODULATION_WHEEL:
        case KEYBOARD.CHORD_SHIFT:
            if (state.amount !== value) {
                return {
                    ...state,
                    amount: value
                };
            }
            break;

        case CHORD_SHIFT.ENABLE:
            if (!state.enabled) {
                return {
                    ...state,
                    chords: (keys ? [keys] : []),
                    activeKeys: (keys ? keys : {}),
                    enabled: true
                };
            }
            break;

        case CHORD_SHIFT.DISABLE:
            if (state.enabled) {
                return {
                    ...state,
                    activeKeys: {},
                    chords: [],
                    enabled: false
                };
            }
            break;

        case KEYBOARD.CHORD_SHIFT_TOGGLE:
            return {
                ...state,
                chords: (!state.enabled && keys) ? [keys] : [],
                activeKeys: state.enabled ? {} : keys,
                enabled: !state.enabled
            };

        case KEYBOARD.KEY_DOWN:
        case MIDI.KEY_DOWN:
            const activeKeys = chord(state.activeKeys, action);

            if (activeKeys !== state.activeKeys) {
                if (state.chords && state.chords[0] && Object.keys(activeKeys).length === Object.keys(state.chords[0]).length) {
                    // add the following test to require each chord to be different from the preceeding chord
                    // && state.chords[state.chords.length - 1].some(note => !activeKeys.hasOwnProperty(note.number))) {
                    const chordClone = Object.entries(activeKeys).reduce((acc, [number, key]) => ({
                        ...acc,
                        [number]: {
                            ...key
                        }
                    }), {});

                    return {
                        ...state,
                        chords: [
                            ...state.chords,
                            chordClone
                        ],
                        activeKeys
                    };
                }
                return {
                    ...state,
                    activeKeys
                };
            }
            break;

        case KEYBOARD.KEY_UP:
        case MIDI.KEY_UP:
            const found = containsKey(state.activeKeys, key);

            if (found) {
                const result = {
                    ...state.activeKeys
                };
                delete result[key.number];

                return {
                    ...state,
                    activeKeys: result
                };
            }

            return state;
    }

    return state;
};

export default chordShift;
