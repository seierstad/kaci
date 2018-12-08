import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";
import * as SYNC from "../sync/actions";
import syncReducer from "../sync/reducers";
import * as STEPS from "./actions";
import {defaultStepsParameters} from "./defaults";


const stepSequencer = (state = {...defaultStepsParameters}, action) => {
    switch (action.type) {
        case STEPS.STEP_ADD:
            return {
                ...state,
                steps: [
                    ...state.steps,
                    {"value": 0}
                ]
            };

        case STEPS.STEP_DELETE:
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, action.step),
                    ...state.steps.slice(action.step + 1)
                ]
            };

        case STEPS.STEP_VALUE_CHANGE: {
            const result = {
                ...state,
                steps: [
                    ...state.steps
                ]
            };
            if (action.value !== result.steps[action.step]["value"]) {
                result.steps[action.step] = {
                    ...result.steps[action.step],
                    "value": action.value
                };
                return result;
            }
            break;
        }

        case STEPS.STEP_GLIDE_TOGGLE: {
            const result = {
                ...state,
                steps: [
                    ...state.steps
                ]
            };

            result.steps[action.step] = {
                ...result.steps[action.step],
                "glide": !result.steps[action.step].glide
            };

            return result;
        }

        case STEPS.LEVELS_COUNT_INCREASE:
            return {
                ...state,
                levels: state.levels + 1
            };

        case STEPS.LEVELS_COUNT_DECREASE: {
            let stepsChanged = false;

            const result = {
                ...state,
                levels: state.levels - 1
            };

            const newSteps = state.steps.map(step => {
                if (step.value >= result.levels) {
                    stepsChanged = true;
                    return {
                        ...step,
                        value: result.levels - 1
                    };
                }
                return step;
            });

            if (stepsChanged) {
                result.steps = newSteps;
            }

            return result;
        }

        case STEPS.GLIDE_TIME_CHANGE:
            return {
                ...state,
                glide: action.value
            };

        case MODULATOR.FREQUENCY_CHANGE:
        case MODULATOR.AMOUNT_CHANGE:
        case MODULATOR.MODE_CHANGE:
        case MODULATOR.RESET:
            return modulatorReducer(state, action);

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

const steps = (state = [], action) => {

    switch (action.type) {

        case STEPS.GLIDE_TIME_CHANGE:
        case STEPS.STEP_ADD:
        case STEPS.STEP_DELETE:
        case STEPS.STEP_VALUE_CHANGE:
        case STEPS.STEP_GLIDE_TOGGLE:
        case STEPS.LEVELS_COUNT_DECREASE:
        case STEPS.LEVELS_COUNT_INCREASE: {
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
                result[action.index] = stepSequencer(state[action.index], action);

                return result;
        }
    }

    return state;
};


export default steps;
