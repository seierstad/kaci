import * as Actions from "../actions";
import { combineReducers } from "redux";

const nullReducer = (state = {}) => state;

const keyboard = (state = {}, action) => {
    switch (action.type) {
        case Actions.KEYBOARD_LAYOUT_CHANGE:
            return {
                ...state,
                activeLayout: action.value
            };
        default:
            return state;
    }
};

const midi = (state = {}, action) => {
    switch (action.type) {
        case Actions.MIDI_ADD_INPUT_PORT:
            return {
                ...state,
                ports: [
                    ...state.ports,
                    action.value
                ]
            };
        case Actions.MIDI_PORT_SELECT:
            if (state.ports.some((item) => item.id === action.value)) {
                return {
                    ...state,
                    portId: action.value
                };
            }
            break;
        case Actions.MIDI_CHANNEL_SELECT:
            return {
                ...state,
                channel: action.value
            };
        case Actions.MIDI_PORT_CONNECTION_CHANGE:
            return {
                ...state,
                ports: state.ports.map(p => p.id === action.value.id ? {...p, connection: action.value.connection} : p)
            };
        case Actions.MIDI_PORT_STATE_CHANGE:
            return {
                ...state,
                ports: state.ports.map(p => p.id === action.value.id ? {...p, state: action.value.state} : p)
            };
    }
    return state;

};

const tuning = nullReducer;
const modulation = nullReducer;

const settings = combineReducers({
    keyboard,
    midi,
    tuning,
    modulation
});

export default settings;
