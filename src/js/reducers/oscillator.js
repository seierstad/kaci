import * as Actions from "../actions";
import {steps} from "./envelopes";

const defaultHarmonics = [{
    denominator: 1,
    enabled: true,
    level: 1,
    numerator: 1
}];

const harmonic = (state = {}, action) => {
    switch (action.type) {
        case Actions.HARMONIC_LEVELS_NORMALIZE:
        case Actions.HARMONIC_LEVEL_CHANGE:
            return {
                ...state,
                level: action.value
            };

        case Actions.HARMONIC_PHASE_CHANGE:
            return {
                ...state,
                phase: action.value
            };

        case Actions.HARMONIC_TOGGLE:
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
        case Actions.HARMONIC_NUMERATOR_CHANGE:
        case Actions.HARMONIC_DENOMINATOR_CHANGE:
            return state;

        case Actions.HARMONIC_LEVELS_NORMALIZE:
            let sum = state.reduce((acc, h) => acc + Math.abs(h.level), 0);

            return state.map((h, i) => harmonic(h, {type, value: (h.level / sum)}));

        case Actions.HARMONIC_LEVEL_CHANGE:
        case Actions.HARMONIC_PHASE_CHANGE:
        case Actions.HARMONIC_TOGGLE:
            if (typeof index === "number") {
                return [
                    ...state.slice(0, index),
                    harmonic(state[index], action),
                    ...state.slice(index + 1)
                ];
            }
    }

    return state;
};

const oscillator = (state = {}, action) => {
    switch (action.type) {
        case Actions.OSCILLATOR_RESONANCE_FACTOR_CHANGE:
            return {
                ...state,
                resonance: action.value
            };

        case Actions.OSCILLATOR_MODE_CHANGE:
            return {
                ...state,
                mode: action.mode
            };

        case Actions.OSCILLATOR_WRAPPER_CHANGE:
            return {
                ...state,
                wrapper: action.value
            };

        case Actions.OSCILLATOR_WAVEFORM_CHANGE:
            return {
                ...state,
                waveform: action.value
            };

        case Actions.OSCILLATOR_MIX_CHANGE:
            return {
                ...state,
                mix: action.value
            };

        case Actions.OSCILLATOR_DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };
    }

    if (action.module === "oscillator") {
        // generic actions targeting oscillator parameters

        switch (action.type) {
            case Actions.ENVELOPE_POINT_DELETE:
            case Actions.ENVELOPE_POINT_ADD:
            case Actions.ENVELOPE_POINT_CHANGE:
                const pd = [
                    ...state.pd
                ];

                pd[action.envelopeIndex] = {
                    steps: steps(state.pd[action.envelopeIndex].steps, action)
                };

                return {
                    ...state,
                    "pd": pd
                };

            case Actions.HARMONIC_NUMERATOR_CHANGE:
            case Actions.HARMONIC_DENOMINATOR_CHANGE:
            case Actions.HARMONIC_LEVEL_CHANGE:
            case Actions.HARMONIC_LEVELS_NORMALIZE:
            case Actions.HARMONIC_PHASE_CHANGE:
            case Actions.HARMONIC_TOGGLE:
                return {
                    ...state,
                    harmonics: harmonics(state.harmonics, action)
                };
        }
    }

    return state;
};

export default oscillator;
