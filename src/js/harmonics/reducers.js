import * as HARMONIC from "./actions";
import {defaultHarmonicParameters} from "./defaults";


const defaultHarmonics = [{...defaultHarmonicParameters}];

const harmonic = (state = {}, action) => {
    switch (action.type) {
        case HARMONIC.LEVELS_NORMALIZE:
        case HARMONIC.LEVEL_CHANGE:
            return {
                ...state,
                level: action.value
            };

        case HARMONIC.PHASE_CHANGE:
            return {
                ...state,
                phase: action.value
            };

        case HARMONIC.TOGGLE:
            return {
                ...state,
                enabled: !state.enabled
            };

    }

    return state;
};

const harmonics = (state = [...defaultHarmonics], action) => {
    const index = state.findIndex(h => h.numerator === action.numerator && h.denominator === action.denominator);
    const {type} = action;

    switch (type) {
        case HARMONIC.LEVELS_NORMALIZE:
            let sum = state.reduce((acc, h) => acc + Math.abs(h.level), 0);

            return state.map((h, i) => harmonic(h, {type, value: (h.level / sum)}));

        case HARMONIC.LEVEL_CHANGE:
        case HARMONIC.PHASE_CHANGE:
        case HARMONIC.TOGGLE:
            if (typeof index === "number") {
                return [
                    ...state.slice(0, index),
                    harmonic(state[index], action),
                    ...state.slice(index + 1)
                ];
            }
            break;

        case HARMONIC.REMOVE:
            if (typeof index === "number") {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)
                ];
            }
            break;

        case HARMONIC.ADD:
            return [
                ...state,
                {
                    ...defaultHarmonicParameters,
                    numerator: action.numerator,
                    denominator: action.denominator
                }
            ].sort((a, b) => (a.numerator / a.denominator) < (b.numerator / b.denominator) ? -1 : 1);
    }

    return state;
};

export default harmonics;

