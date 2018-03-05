import {combineReducers} from "redux";

import * as Actions from "../actions";
import defaultPatch from "../patch";


import envelopes from "./envelopes";
import lfos from "./lfos";
import modulation from "./modulation";
import morse from "./morse";
import steps from "./steps-reducer";
import syncReducer from "./sync";
import oscillator from "./oscillator";

const main = (state = {active: true, pan: 0, gain: 1}) => {
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


const chordshift = (state = {"mode": "portamento"}, action) => {
    switch (action.type) {
        case Actions.CHORD_SHIFT.MODE_CHANGE:
            if (state.mode !== action.mode) {
                return {
                    ...state,
                    "mode": action.mode
                };
            }
            break;

        default:
            break;
    }

    return state;
};

const patch = (state, action) => {

    switch (action.type) {
        case Actions.SYSTEM_RESET:
            return {
                ...defaultPatch
            };

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
        steps,
        envelopes,
        morse,
        modulation,
        chordshift
    })(state, action);
};


export default patch;
