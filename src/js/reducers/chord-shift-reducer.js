import * as Actions from "../actions";

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

const addKeyToChords = (chords = [], key, newChord = true) => {
    if (newChord) {
        return [
            ...chords,
            {
                [key.number]: key
            }
        ];
    }

    const lastChordIndex = chords.length - 1;
    const lastChord = chords[lastChordIndex];

    if (!lastChord.hasOwnProperty(key.number)) {
        const result = [
            ...chords
        ];
        result[lastChordIndex] = {
            ...lastChord,
            [key.number]: key
        };
        return result;
    }

    return chords;
};

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

        case Actions.MIDI_MODULATION_WHEEL:
        case Actions.KEYBOARD_CHORD_SHIFT:
            if (state.value !== value) {
                return {
                    ...state,
                    value
                };
            }
            break;

        case Actions.CHORD_SHIFT_ENABLE:
            if (!state.enabled) {
                return {
                    ...state,
                    chords: (keys ? [keys] : []),
                    activeKeys: (keys ? keys : {}),
                    enabled: true
                };
            }
            break;

        case Actions.CHORD_SHIFT_DISABLE:
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
        case Actions.MIDI_KEY_DOWN:
            const isNewChord = Object.keys(state.activeKeys).length === 0;

            if (!containsKey(state.activeKeys, key)) {
                return {
                    ...state,
                    chords: isNewChord ? [...state.chords, {[key.number]: key}] : addKeyToChords(state.chords, key, false),
                    activeKeys:  {
                        ...state.activeKeys,
                        key
                    }
                };
            }
            break;

        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI_KEY_UP:
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
