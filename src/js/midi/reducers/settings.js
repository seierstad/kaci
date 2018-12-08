import {RESET as SYSTEM_RESET} from "../../settings/actions";
import {PORT} from "../constants";
import defaultSettings from "../defaults";
import {
    ADD_INPUT_PORT,
    CHANNEL_SELECT,
    PORT_CONNECTION_CHANGE,
    PORT_SELECT,
    PORT_STATE_CHANGE,
    TOGGLE
} from "../actions";

const {STATE} = PORT;

const midiPorts = (state = [], action) => {
    switch (action.type) {
        case ADD_INPUT_PORT:
        case PORT_CONNECTION_CHANGE:
        case PORT_STATE_CHANGE:
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

        case SYSTEM_RESET:
            return [...state.filter(p => p.state === STATE.CONNECTED)];

    }
    return state;
};

const midi = (state = {}, action) => {
    switch (action.type) {
        case TOGGLE:
            return {
                ...state,
                active: !state.active
            };

        case PORT_CONNECTION_CHANGE:
        case PORT_STATE_CHANGE:
        case ADD_INPUT_PORT:
            return {
                ...state,
                ports: midiPorts(state.ports, action)
            };

        case PORT_SELECT:
            if (state.ports.some((item) => item.id === action.value) || action.value === "") {
                return {
                    ...state,
                    selectedPort: action.value
                };
            }
            break;

        case CHANNEL_SELECT:
            return {
                ...state,
                channel: action.value
            };

        case SYSTEM_RESET:
            return {
                ...defaultSettings,
                ports: midiPorts(state.ports, action)
            };
    }
    return state;

};

export default midi;
