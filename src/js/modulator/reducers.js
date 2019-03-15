import {
    AMOUNT_CHANGE,
    FREQUENCY_CHANGE,
    MODE_CHANGE,
    RESET
} from "./actions";
import {defaultModulatorParameters} from "./defaults";


const modulatorReducer = (state = {...defaultModulatorParameters}, action) => {
    switch (action.type) {
        case FREQUENCY_CHANGE:
            return {
                ...state,
                "speed": {
                    ...state.speed,
                    "frequency": action.value
                }
            };

        case AMOUNT_CHANGE:
            return {
                ...state,
                "amount": action.value
            };

        case MODE_CHANGE:
            return {
                ...state,
                "mode": action.value
            };

        case RESET:
            // possible implementation: timestamp in the playState?
            return state;

        default:
            break;
    }

    return state;
};

export default modulatorReducer;
