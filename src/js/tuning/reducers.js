import {RESET as SYSTEM_RESET} from "../settings/actions";

import {defaultScale, defaultTuning} from "./defaults";
import {
    REFERENCE_KEY_CHANGE,
    REFERENCE_PITCH_CHANGE,
    SCALE_BASE_CHANGE,
    SCALE_NOTE_COUNT_CHANGE,
    SCALE_SELECT,
    SCALE_TYPE_CHANGE
} from "./actions";


const scale = (state = {}, action) => {
    switch (action.type) {

        case SCALE_BASE_CHANGE:
            return {
                ...state,
                base: action.value
            };

        case SCALE_TYPE_CHANGE:
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

        case SCALE_NOTE_COUNT_CHANGE:
            return {
                ...state,
                notes: action.value
            };

    }
};


const tuning = (state = {...defaultTuning}, action) => {
    switch (action.type) {
        case REFERENCE_PITCH_CHANGE:
            return {
                ...state,
                baseFrequency: {
                    ...state.baseFrequency,
                    value: action.value
                }
            };

        case REFERENCE_KEY_CHANGE:
            return {
                ...state,
                baseKey: action.value
            };

        case SCALE_SELECT:
            return {
                ...state,
                scale: {
                    ...(state.scales.find(s => s.name === action.value) || defaultScale)
                }
            };

        case SYSTEM_RESET:
            return {
                ...defaultTuning
            };

        case SCALE_BASE_CHANGE:
        case SCALE_TYPE_CHANGE:
        case SCALE_NOTE_COUNT_CHANGE:
            return {
                ...state,
                scale: scale(state.scale, action)
            };
    }
    return state;
};

export {
    scale
};

export default tuning;
