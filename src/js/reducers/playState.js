import * as Actions from "../actions";


const key = (state = {down: false}, action) => {
    switch (action.type) {
        case Actions.MIDI_KEY_DOWN:
        case Actions.KEYBOARD_KEY_DOWN:
            return {
                ...state,
                down: true
            };
        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI_KEY_UP:
            return {
                ...state,
                down: false
            };
    }
};

const keys = (state = [], action) => {
    switch (action.type) {
        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI_KEY_DOWN:
        case Actions.MIDI_KEY_UP:
            const result = [
                ...(state.slice(0, action.keyNumber)),
                ...(state.slice(action.keyNumber))
            ];
            result[action.keyNumber] = key({...state[action.keyNumber]}, action);
            return result;
    }
    return state;
};

const defaultMidiClockState = {
    tempo: null,
    sync: 0,
    quarterNoteDuration: 0
};

const midiClock = (state = defaultMidiClockState, action) => {

    switch (action.type) {
        case Actions.MIDI_TEMPO_CHANGE:
            const {tempo, sync, quarterNoteDuration} = action;

            return {
                ...state,
                tempo,
                sync,
                quarterNoteDuration
            };
    }

    return state;
};

const pitchShift = (state = 0, action) => {
    switch (action.type) {
        case Actions.MIDI_PITCHBEND:
        case Actions.KEYBOARD_PITCH_SHIFT:
            return action.value;
    }
    return state;
};

const containsKey = (chord, key) => {
    return chord.find(chordKey => chordKey.number === key.number);
};

const keySort = (a, b) => a.number > b.number ? -1 : 1;


const addKeyToChords = (chords = [], key, newChord) => {
    if (newChord) {
        return [
            ...chords,
            [key]
        ];
    }

    const lastChordIndex = chords.length - 1;
    const lastChord = chords[lastChordIndex];

    if (!containsKey(lastChord, key)) {
        return [
            ...chords.slice(0, lastChordIndex),
            [...lastChord, key].sort(keySort)
        ];
    }

    return chords;
};

const defaultChordShift = {
    enabled: false,
    mode: "portamento",
    chords: [],
    activeKeys: [],
    value: 0
};

const chordShift = (state = defaultChordShift, action, keys) => {
    const key = {
        number: action.keyNumber
    };

    switch (action.type) {

        case Actions.MIDI_MODULATION_WHEEL:
        case Actions.KEYBOARD_CHORD_SHIFT:
            return {
                ...state,
                value: action.value
            };

        case Actions.CHORD_SHIFT_ENABLE:
            return {
                ...state,
                chords: keys.length > 0 ? [keys] : [],
                activeKeys: keys,
                enabled: true
            };

        case Actions.CHORD_SHIFT_DISABLE:
            return {
                ...state,
                activeKeys: [],
                chords: [],
                enabled: false
            };

        case Actions.KEYBOARD_CHORD_SHIFT_TOGGLE:
            return {
                ...state,
                chords: state.enabled || keys.length < 1 ? [] : [keys],
                activeKeys: state.enabled ? [] : keys,
                enabled: !state.enabled
            };

        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.MIDI_KEY_DOWN:
            const isNewChord = state.activeKeys.length === 0;

            return {
                ...state,
                chords:  addKeyToChords(state.chords, key, isNewChord),
                activeKeys: containsKey(state.activeKeys, key) ? state.activeKeys : [...state.activeKeys, key].sort(keySort)
            };

        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI_KEY_UP:
            const found = containsKey(state.activeKeys, key);

            if (found) {
                const index = state.activeKeys.indexOf(found);

                return {
                    ...state,
                    activeKeys: [
                        ...state.activeKeys.slice(0, index),
                        ...state.activeKeys.slice(index + 1)
                    ]
                };
            }

            return state;
    }

    return state;
};

const hold = (state = false, action) => {
    switch (action.type) {
        case "TODO":
            return true;
    }
    return state;
};

const defaultPlayState = {
    keys: [],
    chordShift: defaultChordShift,
    midiClock: defaultMidiClockState,
    hold: false,
    pitchShift: 0
};

const playState = (state = defaultPlayState, action) => {
    const keyReducer = (arr, key) => {
        arr[key.number] = {down: true};
        return arr;
    };

    function disable () {
        return {
            ...state,
            keys: [...state.chordShift.activeKeys.reduce(keyReducer, [])],
            chordShift: chordShift(state.chordShift, action)
        };
    }

    function enable () {
        return {
            ...state,
            keys: [],
            chordShift: chordShift(state.chordShift, action, [...(state.keys.map((key, number) => {if (key && key.down) {return {number};}}).filter(k => !!k))])
        };
    }

    switch (action.type) {
        case Actions.MIDI_TEMPO_CHANGE:
            return {
                ...state,
                midiClock: midiClock(state.midiClock, action)
            };

        case Actions.MIDI_PITCHBEND:
        case Actions.KEYBOARD_PITCH_SHIFT:
            return {
                ...state,
                pitchShift: pitchShift(state.pitchShift, action)
            };

        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI_KEY_DOWN:
        case Actions.MIDI_KEY_UP:
            if (!state.chordShift.enabled) {
                return {
                    ...state,
                    keys: keys(state.keys, action)
                };
            }

            return {
                ...state,
                chordShift: chordShift(state.chordShift, action)
            };

        case Actions.MIDI_MODULATION_WHEEL:
        case Actions.KEYBOARD_CHORD_SHIFT:
            return {
                ...state,
                chordShift: chordShift(state.chordShift, action)
            };

        case Actions.CHORD_SHIFT_DISABLE:
            return disable();

        case Actions.CHORD_SHIFT_ENABLE:
            return enable();

        case Actions.KEYBOARD_CHORD_SHIFT_TOGGLE:
            return state.chordShift.enabled ? disable() : enable();
    }

    return state;
};


export default playState;
