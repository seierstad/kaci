import {combineReducers} from "redux";

import midi from "../midi/reducers/settings";
import * as Actions from "../actions";
import defaultSettings, {defaultScale} from "../configuration";

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


const scale = (state = {}, action) => {
    switch (action.type) {

        case Actions.SCALE_BASE_CHANGE:
            return {
                ...state,
                base: action.value
            };

        case Actions.SCALE_TYPE_CHANGE:
            const result = {
                ...state,
                type: action.value
            };

            if (action.value === "rational") {
                result.ratios = [[1, 1], [result.base, 1]];
            }
            if (action.value === "tepered") {
                result.base = result.base || result.ratios[result.ratios.length - 1][0] / result.ratios[result.ratios.length - 1][1];
                result.notes = result.notes || result.ratios.length;
            }
            return result;

        case Actions.SCALE_NOTE_COUNT_CHANGE:
            return {
                ...state,
                notes: action.value
            };

    }
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

        case Actions.BASE_KEY_CHANGE:
            return {
                ...state,
                baseKey: action.value
            };

        case Actions.TUNING_SELECT_SCALE:
            return {
                ...state,
                scale: {
                    ...(state.scales.find(s => s.name === action.value) || defaultScale)
                }
            };

        case Actions.SYSTEM_RESET:
            return {
                ...defaultSettings.tuning
            };

        case Actions.SCALE_BASE_CHANGE:
        case Actions.SCALE_TYPE_CHANGE:
        case Actions.SCALE_NOTE_COUNT_CHANGE:
            return {
                ...state,
                scale: scale(state.scale, action)
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
