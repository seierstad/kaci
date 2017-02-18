import {combineReducers} from "redux";

import * as Actions from "../actions";

import envelopes, {steps} from "./envelopes";
import lfos from "./lfos";
import modulation from "./modulation";
import syncReducer from "./sync";


const main = (state = {active: true, pan: 0, gain: 1}) => {
    return state;
};

const oscillator = (state = {}, action) => {
    switch (action.type) {
        case Actions.OSCILLATOR_RESONANCE_FACTOR_CHANGE:
            return {
                ...state,
                resonance: action.value
            };

        case Actions.OSCILLATOR_RESONANCE_TOGGLE:
            return {
                ...state,
                resonanceActive: !state.resonanceActive
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
        }
    }

    return state;
};

const output = (state, action) => {
    switch (action.type) {
        case Actions.OUTPUT_GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };

        case Actions.OUTPUT_PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };

        case Actions.OUTPUT_TOGGLE:
            return {
                ...state,
                active: !state.active
            };
    }

    return state;
};


const noise = (state = {}, action) => {
    switch (action.type) {
        case Actions.NOISE_COLOR_CHANGE:
            return {
                ...state,
                color: action.value
            };
    }

    return state;
};

const sub = (state = {}, action) => {
    switch (action.type) {

        case Actions.SUB_DEPTH_CHANGE:
            return {
                ...state,
                depth: action.value
            };

        case Actions.SUB_DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };

        case Actions.SUB_DETUNE_MODE_CHANGE:
            return {
                ...state,
                mode: action.value
            };

        case Actions.SUB_BEAT_FREQUENCY_CHANGE:
            return {
                ...state,
                beat: action.value
            };

        case Actions.SYNC_NUMERATOR_CHANGE:
        case Actions.SYNC_DENOMINATOR_CHANGE:
        case Actions.SYNC_TOGGLE:
            if (action.module === "sub") {
                return {
                    ...state,
                    beat_sync: syncReducer(state.beat_sync, action)
                };
            }
            break;
    }

    return state;
};


const patch = (state, action) => {

    switch (action.type) {
        case Actions.OUTPUT_GAIN_CHANGE:
        case Actions.OUTPUT_PAN_CHANGE:
        case Actions.OUTPUT_TOGGLE:
            return {
                ...state,
                [action.module]: output(state[action.module], action)
            };
    }

    return combineReducers({
        main,
        oscillator,
        noise,
        sub,
        lfos,
        envelopes,
        modulation
    })(state, action);
};


export default patch;
