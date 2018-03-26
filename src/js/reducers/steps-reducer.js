import * as Actions from "../actions";
import {defaultStepsParameters} from "../configuration";

import modulatorReducer from "./modulator-reducer";
import syncReducer from "./sync";


const stepSequencer = (state = {...defaultStepsParameters}, action) => {
    switch (action.type) {
        case Actions.STEPS.STEP_ADD:
            return {
                ...state,
                steps: [
                    ...state.steps,
                    0
                ]
            };

        case Actions.STEPS.STEP_VALUE_CHANGE:
            const result = {
                ...state,
                steps: [
                    ...state.steps
                ]
            };
            if (action.value !== result.steps[action.step]) {
                result.steps[action.step] = action.value;
                return result;
            }
            break;

        case Actions.STEPS.LEVELS_COUNT_CHANGE:
            return {
                ...state,
                levels: action.levels
            };

        case Actions.STEPS.CHANGE_GLIDE:
            return {
                ...state,
                glide: action.value
            };

        case Actions.MODULATOR_FREQUENCY_CHANGE:
        case Actions.MODULATOR_AMOUNT_CHANGE:
        case Actions.MODULATOR_MODE_CHANGE:
        case Actions.MODULATOR_RESET:
            return modulatorReducer(state, action);

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

    switch (action.type) {

        case Actions.STEPS.CHANGE_GLIDE:
        case Actions.STEPS.STEP_ADD:
        case Actions.STEPS.STEP_VALUE_CHANGE:
        case Actions.STEPS.LEVELS_COUNT_CHANGE: {
            const result = [
                ...state
            ];
            const step = stepSequencer(state[action.index], action);

            if (step !== result[action.index]) {
                result[action.index] = step;
                return result;
            }
            break;
        }
    }

    if (action.module === "steps") {

        switch (action.type) {
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
                result[action.index] = stepSequencer(state[action.index], action);

                return result;
        }
    }

    return state;
};


export default steps;
