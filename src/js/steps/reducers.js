import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";
import * as SYNC from "../sync/actions";
import syncReducer from "../sync/reducers";
import {generatorFunctions} from "./sequence-generator-functions";
import {
    GENERATE_SEQUENCE,
    GLIDE_AT_CHANGE,
    GLIDE_AT_EVERY,
    GLIDE_AT_FALLING,
    GLIDE_AT_RISING,
    GLIDE_INVERT,
    GLIDE_NONE,
    GLIDE_SHIFT,
    GLIDE_TIME_CHANGE,
    GLIDE_MODE_CHANGE,
    GLIDE_SLOPE_CHANGE,
    INVERT_VALUES,
    LEVELS_COUNT_DECREASE,
    LEVELS_COUNT_INCREASE,
    REVERSE,
    SEQUENCE_SHIFT,
    STEP_ADD,
    STEP_DELETE,
    STEP_GLIDE_TOGGLE,
    STEP_VALUE_CHANGE
} from "./actions";
import {defaultStepsParameters} from "./defaults";


function glidesByStepChange (state, compareFn, interval = 1) {
    let previousValue = state.steps[state.steps.length - 1].value;
    let changeIndex = -1;

    return {
        ...state,
        steps: [
            ...state.steps.map(step => {
                const changed = compareFn(step.value, previousValue);
                if (changed) {
                    changeIndex += 1;
                }
                previousValue = step.value;
                return {
                    ...step,
                    glide: changed && (changeIndex % interval === 0)
                };
            })
        ]
    };
}


const stepSequencer = (state = {...defaultStepsParameters}, action) => {
    switch (action.type) {
        case GENERATE_SEQUENCE: {
            const {
                generatorName,
                generatorParameters,
                normalize
            } = action;

            const {
                [generatorName]: generator
            } = generatorFunctions;

            if (typeof generator === "function") {
                const values = generator(generatorParameters);
                const minMax = values.reduce((acc, curr) => ({
                    min: Math.min(curr, acc.min),
                    max: Math.max(curr, acc.max)
                }), {
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER
                });


                if (normalize) {
                    return {
                        ...state,
                        levels: minMax.max - minMax.min + 1,
                        steps: values.map(value => ({value: value - minMax.min}))
                    };
                }

                return {
                    ...state,
                    levels: minMax.max + 1,
                    steps: values.map(value => ({value}))
                };
            }

            break;
        }

        case STEP_ADD:
            return {
                ...state,
                steps: [
                    ...state.steps,
                    {"value": 0}
                ]
            };

        case STEP_DELETE:
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, action.step),
                    ...state.steps.slice(action.step + 1)
                ]
            };

        case STEP_VALUE_CHANGE: {
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

        case STEP_GLIDE_TOGGLE: {
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

        case LEVELS_COUNT_INCREASE:
            return {
                ...state,
                levels: state.levels + 1
            };

        case LEVELS_COUNT_DECREASE: {
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

        case GLIDE_TIME_MODE_CHANGE:
            return {
                ...state,
                glide: {
                    ...state.glide,
                    mode: action.mode
                }
            };
        case GLIDE_TIME_CHANGE:
            return {
                ...state,
                glide: action.value
            };

        case GLIDE_AT_CHANGE:
            return glidesByStepChange (state, (curr, prev) => (curr !== prev), action.interval);

        case GLIDE_AT_FALLING:
            return glidesByStepChange (state, (curr, prev) => (curr < prev), action.interval);

        case GLIDE_AT_RISING:
            return glidesByStepChange (state, (curr, prev) => (curr > prev), action.interval);

        case GLIDE_AT_EVERY:
            return {
                ...state,
                steps: [
                    ...state.steps.map((step, i) => ({...step, glide: i % action.interval === 0}))
                ]
            };

        case GLIDE_NONE:
            return {
                ...state,
                steps: [
                    ...state.steps.map(step => ({...step, glide: false}))
                ]
            };

        case GLIDE_INVERT:
            return {
                ...state,
                steps: [
                    ...state.steps.map(step => ({...step, glide: !step.glide}))
                ]
            };

        case GLIDE_SHIFT: {
            const {
                shift = 0
            } = action;
            const length = state.steps.length;

            return {
                ...state,
                steps: [
                    ...state.steps.map((step, i) => {
                        return {
                            ...step,
                            glide: !!state.steps[(length + i - shift) % length].glide
                        };
                    })
                ]
            };
        }

        case SEQUENCE_SHIFT:
            return {
                ...state,
                steps: [
                    ...state.steps.slice(-action.shift),
                    ...state.steps.slice(0, -action.shift)
                ]
            };

        case INVERT_VALUES:
            return {
                ...state,
                steps: [
                    ...state.steps.map(step => ({...step, value: state.levels - 1 - step.value}))
                ]
            };

        case REVERSE:
            return {
                ...state,
                steps: [
                    ...state.steps.slice().reverse().map(step => ({...step}))
                ]
            };
    }

    return state;
};

const stepSequencers = (state = [], action) => {

    switch (action.type) {
        case GENERATE_SEQUENCE:
        case GLIDE_AT_CHANGE:
        case GLIDE_AT_EVERY:
        case GLIDE_AT_FALLING:
        case GLIDE_AT_RISING:
        case GLIDE_INVERT:
        case GLIDE_NONE:
        case GLIDE_SHIFT:
        case GLIDE_TIME_CHANGE:
        case INVERT_VALUES:
        case LEVELS_COUNT_DECREASE:
        case LEVELS_COUNT_INCREASE:
        case REVERSE:
        case SEQUENCE_SHIFT:
        case STEP_ADD:
        case STEP_DELETE:
        case STEP_GLIDE_TOGGLE:
        case STEP_VALUE_CHANGE: {
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
            case MODULATOR.RESET: {
                const result = [
                    ...state
                ];
                result[action.index] = modulatorReducer(state[action.index], action);

                return result;
            }

            case SYNC.DENOMINATOR_CHANGE:
            case SYNC.NUMERATOR_CHANGE:
            case SYNC.TOGGLE: {

                const result = [
                    ...state
                ];
                result[action.index] = {
                    ...state[action.index],
                    "sync": syncReducer(state.sync, action)
                };

                return result;
            }
        }
    }

    return state;
};


export default stepSequencers;
