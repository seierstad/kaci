import * as Actions from "../actions";
import {defaultModulatorParameters} from "../configuration";


const modulatorReducer = (state = {...defaultModulatorParameters}, action) => {
    switch (action.type) {
        case Actions.MODULATOR_FREQUENCY_CHANGE:
            return {
                ...state,
                "frequency": action.value
            };

        case Actions.MODULATOR_AMOUNT_CHANGE:
            return {
                ...state,
                "amount": action.value
            };

        case Actions.MODULATOR_MODE_CHANGE:
            return {
                ...state,
                "mode": action.value
            };

        case Actions.MODULATOR_RESET:
            // possible implementation: timestamp in the playState?
            return state;

        default:
            break;
    }

    return state;
};

export default modulatorReducer;
