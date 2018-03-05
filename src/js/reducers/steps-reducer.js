import * as Actions from "../actions";
import {defaultStepsParameters} from "../configuration";

import syncReducer from "./sync";


const stepSequencer = (state = {...defaultStepsParameters}, action) => {
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

const steps = (state = [], action) => {

    if (action.module === "steps") {

        switch (action.type) {
            case Actions.MODULATOR_AMOUNT_CHANGE:
            case Actions.MODULATOR_FREQUENCY_CHANGE:
            case Actions.MODULATOR_MODE_CHANGE:
            case Actions.MODULATOR_RESET:
            case Actions.STEPS.STEP_ADD:
            case Actions.STEPS.STEP_CHANGE:
            case Actions.STEPS.LEVELS_COUNT_CHANGE:
            case Actions.SYNC_DENOMINATOR_CHANGE:
            case Actions.SYNC_NUMERATOR_CHANGE:
            case Actions.SYNC_TOGGLE:

                const result = [
                    ...state
                ];
                result[action.index] = stepSequencer(state[action.index], action);

                return result;
        }
    }

    return state;
};


export default steps;
