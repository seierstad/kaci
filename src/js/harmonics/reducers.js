import {fourierSeries} from "../waveform/waveforms";

import {
    ADD,
    LEVEL_CHANGE,
    LEVELS_NORMALIZE,
    PHASE_CHANGE,
    REMOVE,
    TOGGLE,
    SERIES
} from "./actions";
import {defaultHarmonicParameters} from "./defaults";

const defaultHarmonics = [{...defaultHarmonicParameters}];

const harmonic = (state = {}, action) => {
    switch (action.type) {
        case LEVELS_NORMALIZE:
        case LEVEL_CHANGE:
            return {
                ...state,
                level: action.value
            };

        case PHASE_CHANGE:
            return {
                ...state,
                phase: action.value
            };

        case TOGGLE:
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
        case LEVELS_NORMALIZE:
            let sum = state.reduce((acc, h) => acc + Math.abs(h.level), 0);

            return state.map(h => harmonic(h, {type, value: (h.level / sum)}));

        case LEVEL_CHANGE:
        case PHASE_CHANGE:
        case TOGGLE:
            if (typeof index === "number") {
                return [
                    ...state.slice(0, index),
                    harmonic(state[index], action),
                    ...state.slice(index + 1)
                ];
            }
            break;

        case REMOVE:
            if (typeof index === "number") {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)
                ];
            }
            break;

        case ADD:
            return [
                ...state,
                {
                    ...defaultHarmonicParameters,
                    numerator: action.numerator,
                    denominator: action.denominator
                }
            ].sort((a, b) => (a.numerator / a.denominator) < (b.numerator / b.denominator) ? -1 : 1);

        case SERIES:
            if (action.preset) {
                return (fourierSeries[action.preset](action.partials)
                    .map((level, index) => ({...defaultHarmonicParameters, level, numerator: index, denominator: 1}))
                    .filter(h => h.level !== 0)
                );
            }
    }

    return state;
};

export default harmonics;

