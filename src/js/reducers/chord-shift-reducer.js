import * as Actions from "../actions";

import chord from "./chord-reducer";


const defaultChordShift = {
    enabled: false,
    mode: "portamento",
    chords: [],
    activeKeys: {},
    value: 0
};

const containsKey = (chord = {}, key) => {
    return chord.hasOwnProperty(key.number);
};

const keySort = (a, b) => a.number > b.number ? -1 : 1;


const chordShift = (state = defaultChordShift, action = {}, keys) => {
    const {
        keyNumber,
        type,
        value
    } = action;

    const key = {
        number: keyNumber
    };

    switch (type) {

        case Actions.MIDI.MODULATION_WHEEL:
        case Actions.KEYBOARD_CHORD_SHIFT:
            if (state.value !== value) {
                return {
                    ...state,
                    value
                };
            }
            break;

        case Actions.CHORD_SHIFT.ENABLE:
            if (!state.enabled) {
                return {
                    ...state,
                    chords: (keys ? [keys] : []),
                    activeKeys: (keys ? keys : {}),
                    enabled: true
                };
            }
            break;

        case Actions.CHORD_SHIFT.DISABLE:
            if (state.enabled) {
                return {
                    ...state,
                    activeKeys: {},
                    chords: [],
                    enabled: false
                };
            }
            break;

        case Actions.KEYBOARD_CHORD_SHIFT_TOGGLE:
            return {
                ...state,
                chords: (!state.enabled && keys) ? [keys] : [],
                activeKeys: state.enabled ? {} : keys,
                enabled: !state.enabled
            };

        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.MIDI.KEY_DOWN:
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

        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI.KEY_UP:
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
