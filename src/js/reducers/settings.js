import * as Actions from "../actions";
import {combineReducers} from "redux";

import {PORT} from "../midiConstants";
import defaultSettings from "../configuration";

const {STATE} = PORT;
const nullReducer = (state = {}) => state;

const keyboard = (state = {}, action) => {
    switch (action.type) {
        case Actions.KEYBOARD_LAYOUT_CHANGE:
            return {
                ...state,
                activeLayout: action.value
            };

        case Actions.SYSTEM_RESET:
            return {
                ...defaultSettings.keyboard
            };

        default:
            return state;
    }
};

const midiPorts = (state = [], action) => {
    switch (action.type) {
        case Actions.MIDI_ADD_INPUT_PORT:
        case Actions.MIDI_PORT_CONNECTION_CHANGE:
        case Actions.MIDI_PORT_STATE_CHANGE:
            const index = state.findIndex(p => p.id === action.value.id);
            if (index === -1) {
                return [
                    ...state,
                    action.value
                ];
            }
            return [
                ...(state.slice(0, index)),
                action.value,
                ...(state.slice(index + 1))
            ];

        case Actions.SYSTEM_RESET:
            return [...state.filter(p => p.state === STATE.CONNECTED)];

    }
    return state;
};

const midi = (state = {}, action) => {
    switch (action.type) {
        case Actions.MIDI_PORT_CONNECTION_CHANGE:
        case Actions.MIDI_PORT_STATE_CHANGE:
        case Actions.MIDI_ADD_INPUT_PORT:
            return {
                ...state,
                ports: midiPorts(state.ports, action)
            };

        case Actions.MIDI_PORT_SELECT:
            if (state.ports.some((item) => item.id === action.value) || action.value === "") {
                return {
                    ...state,
                    selectedPort: action.value
                };
            }
            break;

        case Actions.MIDI_CHANNEL_SELECT:
            return {
                ...state,
                channel: action.value
            };

        case Actions.SYSTEM_RESET:
            return {
                ...defaultSettings.midi,
                ports: midiPorts(state.ports, action)
            };
    }
    return state;

};

const tuning = (state = {}, action) => {
    switch (action.type) {
        case Actions.BASE_FREQUENCY_CHANGE:
            return {
                ...state,
                baseFrequency: {
                    ...state.baseFrequency,
                    value: action.value
                }
            };
        case Actions.SYSTEM_RESET:
            return {
                ...defaultSettings.tuning
            };
    }
    return state;
};

const modulation = nullReducer;

const settings = (state, action) => {
    if (action.type === Actions.SET_SYSTEM_CONFIGURATION) {
        return action.configuration;
    }
    return combineReducers({
        keyboard,
        midi,
        tuning,
        modulation
    })(state, action);
};

export default settings;
