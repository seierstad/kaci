import {steps} from "../envelope/reducers";
import * as ENVELOPE from "../envelope/actions";
import waveform from "../waveform/reducer";
import harmonics from "./harmonics/reducers";

import {
    DETUNE_CHANGE,
    MIX_CHANGE,
    MODE_CHANGE,
    RESONANCE_FACTOR_CHANGE,
    HARMONICS_MIX_CHANGE
} from "./actions";


const oscillator = (state = {}, action) => {
    switch (action.type) {
        case RESONANCE_FACTOR_CHANGE:
            return {
                ...state,
                resonance: action.value
            };

        case MODE_CHANGE:
            return {
                ...state,
                mode: action.mode
            };

        case MIX_CHANGE:
            return {
                ...state,
                pd_mix: action.value
            };

        case DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };

        case HARMONICS_MIX_CHANGE:
            return {
                ...state,
                harm_mix: action.value
            };
    }

    if (action.module === "oscillator") {
        // generic actions targeting oscillator parameters

        if (action.submodule === "waveform") {
            const newWaveform = waveform(state.waveform, action);
            if (newWaveform !== state.waveform) {
                return {
                    ...state,
                    waveform: newWaveform
                };
            }
        }

        if (action.submodule === "wrapper") {
            const newWrapper = waveform(state.wrapper, action);
            if (newWrapper !== state.wrapper) {
                return {
                    ...state,
                    wrapper: newWrapper
                };
            }
        }

        const newHarmonics = harmonics(state.harmonics, action);
        if (newHarmonics !== state.harmonics) {
            return {
                ...state,
                harmonics: newHarmonics
            };
        }

        switch (action.type) {
            case ENVELOPE.POINT_DELETE:
            case ENVELOPE.POINT_ADD:
            case ENVELOPE.POINT_CHANGE:
                const newPdEnvelopeSteps = steps(state.pd[action.envelopeIndex].steps, action);
                if (newPdEnvelopeSteps !== state.pd[action.envelopeIndex].steps) {


                    const pd = [
                        ...state.pd
                    ];

                    pd[action.envelopeIndex] = {
                        steps: newPdEnvelopeSteps
                    };

                    return {
                        ...state,
                        "pd": pd
                    };
                }
                break;
        }
    }

    return state;
};

export default oscillator;
