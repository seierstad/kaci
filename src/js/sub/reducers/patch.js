import * as SYNC from "../../sync/actions";
import syncReducer from "../../sync/reducers";
import {
    BEAT_FREQUENCY_CHANGE,
    DEPTH_CHANGE,
    DETUNE_CHANGE,
    DETUNE_MODE_CHANGE
} from "../actions";

const sub = (state = {}, action) => {
    switch (action.type) {

        case DEPTH_CHANGE:
            return {
                ...state,
                depth: action.value
            };

        case DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };

        case DETUNE_MODE_CHANGE:
            return {
                ...state,
                mode: action.value
            };

        case BEAT_FREQUENCY_CHANGE:
            return {
                ...state,
                beat: action.value
            };

        case SYNC.NUMERATOR_CHANGE:
        case SYNC.DENOMINATOR_CHANGE:
        case SYNC.TOGGLE:
            if (action.module === "sub") {
                return {
                    ...state,
                    sync: syncReducer(state.beat_sync, action)
                };
            }
            break;
    }

    return state;
};

export default sub;
