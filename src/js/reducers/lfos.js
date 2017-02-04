import * as Actions from "../actions";
import syncReducer from "./sync";


const lfo = (state = [], action) => {
    switch (action.type) {
        case Actions.LFO_FREQUENCY_CHANGE:
            return {
                ...state,
                "frequency": action.value
            };

        case Actions.LFO_AMOUNT_CHANGE:
            return {
                ...state,
                "amount": action.value
            };

        case Actions.LFO_WAVEFORM_CHANGE:
            return {
                ...state,
                "waveform": action.value
            };

        case Actions.LFO_RESET:
            // possible implementation: timestamp in the viewState?
            return state;

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

        let result = [
            ...state
        ];
        result[action.index] = lfo(state[action.index], action);

        return result;
    }
    return state;
};


export default lfos;
