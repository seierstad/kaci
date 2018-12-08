import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";
import syncReducer from "../sync/reducers";
import * as SYNC from "../sync/actions";
import {defaultLfoParameters} from "./defaults";
import {WAVEFORM_CHANGE} from "./actions";


const lfo = (state = {...defaultLfoParameters}, action) => {
    switch (action.type) {

        case MODULATOR.FREQUENCY_CHANGE:
        case MODULATOR.AMOUNT_CHANGE:
        case MODULATOR.MODE_CHANGE:
        case MODULATOR.RESET:
            return modulatorReducer(state, action);

        case WAVEFORM_CHANGE:
            return {
                ...state,
                "waveform": action.value
            };

        case SYNC.NUMERATOR_CHANGE:
        case SYNC.DENOMINATOR_CHANGE:
        case SYNC.TOGGLE:
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
            case WAVEFORM_CHANGE:
            case MODULATOR.AMOUNT_CHANGE:
            case MODULATOR.FREQUENCY_CHANGE:
            case MODULATOR.MODE_CHANGE:
            case MODULATOR.RESET:
            case SYNC.DENOMINATOR_CHANGE:
            case SYNC.NUMERATOR_CHANGE:
            case SYNC.TOGGLE:

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
