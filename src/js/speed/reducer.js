import {
    FREQUENCY_CHANGE,
    SPEED_UNIT_CHANGE
} from "./actions";
import {defaultSpeedParameters} from "./defaults";
import syncReducer from "./sync/reducers";


const speedReducer = (state = {...defaultSpeedParameters}, action) => {
    switch (action.type) {
        case FREQUENCY_CHANGE:
            if (action.value !== state.frequency) {
                return {
                    ...state,
                    "frequency": action.value
                };
            }
            break;

        case SPEED_UNIT_CHANGE:
            return {
                ...state,
                "speedUnit": action.value
            };
    }

    if (state.sync) {
        const newSync = syncReducer(state.sync, action);
        if (newSync !== state.sync) {
            return {
                ...state,
                sync: newSync
            };
        }
    }

    return state;
};


export default speedReducer;
