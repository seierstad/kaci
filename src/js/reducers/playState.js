import {combineReducers} from "redux";

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

const midiClock = (state = {tempo: null, sync: 0, quarterNoteDuration: 0}, action) => {

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

const chordShift = (state = 0, action) => {
    switch (action.type) {
        case Actions.MIDI_MODULATION_WHEEL:
        case Actions.KEYBOARD_CHORD_SHIFT:
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

const playState = combineReducers({
    keys,
    pitchShift,
    chordShift,
    hold,
    midiClock
});

export default playState;
