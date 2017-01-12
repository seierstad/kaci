import * as Actions from "../actions";
import { combineReducers } from "redux";
import envelopes, {steps} from "./envelopes.jsx";
import lfos from "./lfos.jsx";
import modulation from "./modulation.jsx";

const nullReducer = (state = {}, action) => state;
const vca = (state = {gain: 1}, action) => {
    switch (action.type) {
        case Actions.VCA_GAIN_CHANGE:
            return {
                gain: action.value
            };
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
                let pd = [...state.pd];
                pd[action.envelopeIndex].steps = steps(state.pd[action.envelopeIndex].steps, action);

                return {
                    ...state,
                    pd
                };
        }

    }
    return state;
};


const noise = (state = {}, action) => {
    switch (action.type) {
        case Actions.NOISE_GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };
        case Actions.NOISE_PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };
        case Actions.NOISE_TOGGLE:
            return {
                ...state,
                active: !state.active
            };
        default:
            return state;
    }
};

const sub = (state = {}, action) => {
    switch (action.type) {
        case Actions.SUB_GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };
        case Actions.SUB_PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };
        case Actions.SUB_TOGGLE:
            return {
                ...state,
                active: !state.active
            };
        case Actions.SUB_DEPTH_CHANGE:
            return {
                ...state,
                depth: action.value
            };
        default:
            return state;
    }
};


const patch = combineReducers({
    vca,
    oscillator,
    noise,
    sub,
    lfos,
    envelopes,
    modulation
});

export default patch;
