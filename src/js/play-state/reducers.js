import * as MIDI from "../midi/actions";
import {midiClock} from "../midi/reducers/play-state";
import chordShift from "../chord-shift/reducers";
import * as CHORD_SHIFT from "../chord-shift/actions";
import * as KEYBOARD from "../keyboard/actions";
import chord from "./chord-reducer";

const key = (state = {down: false}, action) => {
    switch (action.type) {
        case MIDI.KEY_DOWN:
        case KEYBOARD.KEY_DOWN:
            return {
                ...state,
                down: true
            };
        case KEYBOARD.KEY_UP:
        case MIDI.KEY_UP:
            return {
                ...state,
                down: false
            };
    }
};

const pitchShift = (state = 0, action) => {
    switch (action.type) {
        case MIDI.PITCHBEND:
        case KEYBOARD.PITCH_SHIFT:
            return action.value;
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
    keys: {},
    chordShift: chordShift(),
    midiClock: midiClock(),
    hold: false,
    pitchShift: 0
};

const keyReducer = (arr, key) => {
    arr[key.number] = {down: true};
    return arr;
};

const playState = (state = defaultPlayState, action) => {

    function disable () {
        return {
            ...state,
            keys: {...state.chordShift.activeKeys},
            chordShift: chordShift(state.chordShift, action)
        };
    }

    function enable () {
        return {
            ...state,
            keys: {},
            chordShift: chordShift(state.chordShift, action, state.keys)
        };
    }

    switch (action.type) {
        case MIDI.TEMPO_CHANGE:
            return {
                ...state,
                midiClock: midiClock(state.midiClock, action)
            };

        case MIDI.PITCHBEND:
        case KEYBOARD.PITCH_SHIFT:
            return {
                ...state,
                pitchShift: pitchShift(state.pitchShift, action)
            };

        case KEYBOARD.KEY_DOWN:
        case KEYBOARD.KEY_UP:
        case MIDI.KEY_DOWN:
        case MIDI.KEY_UP:
            if (!state.chordShift.enabled) {
                const newKeysState = chord(state.keys, action);
                if (newKeysState !== state.keys) {

                    return {
                        ...state,
                        keys: newKeysState
                    };
                }
                break;
            }

            const newChordShiftState = chordShift(state.chordShift, action);

            if (newChordShiftState !== state.chordShift) {
                return {
                    ...state,
                    chordShift: newChordShiftState
                };
            }
            break;

        case MIDI.MODULATION_WHEEL:
        case KEYBOARD.CHORD_SHIFT:
            if (state.chordShift.enabled) {
                const newChordShiftState = chordShift(state.chordShift, action);

                if (newChordShiftState !== state.chordShift) {
                    return {
                        ...state,
                        chordShift: newChordShiftState
                    };
                }
            }
            break;

        case CHORD_SHIFT.DISABLE:
            return disable();

        case CHORD_SHIFT.ENABLE:
            return enable();

        case KEYBOARD.CHORD_SHIFT_TOGGLE:
            return state.chordShift.enabled ? disable() : enable();
    }

    return state;
};


export default playState;
