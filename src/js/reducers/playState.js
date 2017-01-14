import * as Actions from "../actions";
import config from "../configuration";

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
        case Actions.MIDI_KEY_DOWN:
        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.KEYBOARD_KEY_UP:
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

const playState = (state = {keys: [], pitchShift: 0, chordShift: 0, hold: false}, action) => {
    switch (action.type) {
        case Actions.MIDI_KEY_DOWN:
        case Actions.MIDI_KEY_UP:
        case Actions.KEYBOARD_KEY_DOWN:
        case Actions.KEYBOARD_KEY_UP:
            return {
                ...state,
                keys: keys(state.keys, action)
            };
        case Actions.KEYBOARD_PITCH_SHIFT:
            return {
                ...state,
                pitchShift: action.value
            };
        case Actions.KEYBOARD_CHORD_SHIFT:
            return {
                ...state,
                chordShift: action.value
            };

    }
    return state;
};

export default playState;
