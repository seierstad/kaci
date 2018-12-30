import * as HARMONIC from "../harmonics/actions";
import harmonics from "../harmonics/reducers";
import * as OSCILLATOR from "../oscillator/actions";
import {steps} from "../envelope/reducers";
import * as ENVELOPE from "../envelope/actions";


const oscillator = (state = {}, action) => {
    switch (action.type) {
        case OSCILLATOR.RESONANCE_FACTOR_CHANGE:
            return {
                ...state,
                resonance: action.value
            };

        case OSCILLATOR.MODE_CHANGE:
            return {
                ...state,
                mode: action.mode
            };

        case OSCILLATOR.WRAPPER_CHANGE:
            return {
                ...state,
                wrapper: action.value
            };

        case OSCILLATOR.WAVEFORM_CHANGE:
            return {
                ...state,
                waveform: action.value
            };

        case OSCILLATOR.MIX_CHANGE:
            return {
                ...state,
                mix: action.value
            };

        case OSCILLATOR.DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };
    }

    if (action.module === "oscillator") {
        // generic actions targeting oscillator parameters

        switch (action.type) {
            case ENVELOPE.POINT_DELETE:
            case ENVELOPE.POINT_ADD:
            case ENVELOPE.POINT_CHANGE:
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

            case HARMONIC.LEVEL_CHANGE:
            case HARMONIC.LEVELS_NORMALIZE:
            case HARMONIC.PHASE_CHANGE:
            case HARMONIC.TOGGLE:
            case HARMONIC.ADD:
            case HARMONIC.REMOVE:
                return {
                    ...state,
                    harmonics: harmonics(state.harmonics, action)
                };
        }
    }

    return state;
};

export default oscillator;
