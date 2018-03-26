import * as Actions from "../actions";
import {defaultLfoParameters} from "../configuration";

import modulatorReducer from "./modulator-reducer";
import syncReducer from "./sync";


const lfo = (state = {...defaultLfoParameters}, action) => {
    switch (action.type) {

        case Actions.MODULATOR_FREQUENCY_CHANGE:
        case Actions.MODULATOR_AMOUNT_CHANGE:
        case Actions.MODULATOR_MODE_CHANGE:
        case Actions.MODULATOR_RESET:
            return modulatorReducer(state, action);

        case Actions.LFO_WAVEFORM_CHANGE:
            return {
                ...state,
                "waveform": action.value
            };

        case Actions.SYNC_NUMERATOR_CHANGE:
        case Actions.SYNC_DENOMINATOR_CHANGE:
        case Actions.SYNC_TOGGLE:
            return {
                ...state,
                "sync": syncReducer(state.sync, action)
            };
    }

    return state;
};

const lfos = (state = [], action) => {
    if (action.module === "lfos") {

        switch (action.type) {
            case Actions.LFO_WAVEFORM_CHANGE:
            case Actions.MODULATOR_AMOUNT_CHANGE:
            case Actions.MODULATOR_FREQUENCY_CHANGE:
            case Actions.MODULATOR_MODE_CHANGE:
            case Actions.MODULATOR_RESET:
            case Actions.SYNC_DENOMINATOR_CHANGE:
            case Actions.SYNC_NUMERATOR_CHANGE:
            case Actions.SYNC_TOGGLE:

                const result = [
                    ...state
                ];
                result[action.index] = lfo(state[action.index], action);

                return result;
        }
    }

    return state;
};


export default lfos;
