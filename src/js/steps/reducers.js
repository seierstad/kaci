import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";
import * as SYNC from "../speed/sync/actions";
import * as SPEED from "../speed/actions";
import speedReducer from "../speed/reducer";
import {generatorFunctions} from "./sequence-generator-functions";

import {
    GENERATE_SEQUENCE,
    GLIDE_AT_CHANGE,
    GLIDE_AT_EVERY,
    GLIDE_AT_FALLING,
    GLIDE_AT_RISING,
    GLIDE_INVERT,
    GLIDE_MODE_CHANGE,
    GLIDE_NONE,
    GLIDE_SHIFT,
    GLIDE_SLOPE_CHANGE,
    GLIDE_TIME_CHANGE,
    INVERT_VALUES,
    MAX_VALUE_DECREASE,
    MAX_VALUE_INCREASE,
    REVERSE,
    SEQUENCE_SHIFT,
    STEP_ADD,
    STEP_DELETE,
    STEP_GLIDE_TOGGLE,
    STEP_VALUE_CHANGE
} from "./actions";
import {defaultStepsParameters} from "./defaults";


function glidesByStepChange (state, compareFn, interval = 1) {
    let previousValue = state.sequence[state.sequence.length - 1].value;
    let changeIndex = -1;

    return {
        ...state,
        sequence: [
            ...state.sequence.map(step => {
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
                        maxValue: minMax.max - minMax.min,
                        sequence: values.map(value => ({value: value - minMax.min}))
                    };
                }

                return {
                    ...state,
                    maxValue: minMax.max,
                    sequence: values.map(value => ({value}))
                };
            }

            break;
        }

        case STEP_ADD:
            return {
                ...state,
                sequence: [
                    ...state.sequence,
                    {"value": 0}
                ]
            };

        case STEP_DELETE:
            return {
                ...state,
                sequence: [
                    ...state.sequence.slice(0, action.step),
                    ...state.sequence.slice(action.step + 1)
                ]
            };

        case STEP_VALUE_CHANGE: {
            const result = {
                ...state,
                sequence: [
                    ...state.sequence
                ]
            };
            if (action.value !== result.sequence[action.step]["value"]) {
                result.sequence[action.step] = {
                    ...result.sequence[action.step],
                    "value": action.value
                };
                return result;
            }
            break;
        }

        case STEP_GLIDE_TOGGLE: {
            const result = {
                ...state,
                sequence: [
                    ...state.sequence
                ]
            };

            result.sequence[action.step] = {
                ...result.sequence[action.step],
                "glide": !result.sequence[action.step].glide
            };

            return result;
        }

        case MAX_VALUE_INCREASE:
            return {
                ...state,
                maxValue: state.maxValue + 1
            };

        case MAX_VALUE_DECREASE: {
            let sequenceChanged = false;

            const result = {
                ...state,
                maxValue: state.maxValue - 1
            };

            const newSteps = state.sequence.map(step => {
                if (step.value > result.maxValue) {
                    sequenceChanged = true;
                    return {
                        ...step,
                        value: result.maxValue
                    };
                }
                return step;
            });

            if (sequenceChanged) {
                result.sequence = newSteps;
            }

            return result;
        }

        case GLIDE_MODE_CHANGE:
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
                glide: {
                    ...state.glide,
                    [action.direction]: {
                        ...state.glide[action.direction],
                        time: action.value
                    }
                }
            };

        case GLIDE_SLOPE_CHANGE:
            return {
                ...state,
                glide: {
                    ...state.glide,
                    [action.direction]: {
                        ...state.glide[action.direction],
                        slope: action.value
                    }
                }
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
                sequence: [
                    ...state.sequence.map((step, i) => ({...step, glide: i % action.interval === 0}))
                ]
            };

        case GLIDE_NONE:
            return {
                ...state,
                sequence: [
                    ...state.sequence.map(step => ({...step, glide: false}))
                ]
            };

        case GLIDE_INVERT:
            return {
                ...state,
                sequence: [
                    ...state.sequence.map(step => ({...step, glide: !step.glide}))
                ]
            };

        case GLIDE_SHIFT: {
            const {
                shift = 0
            } = action;
            const length = state.sequence.length;

            return {
                ...state,
                sequence: [
                    ...state.sequence.map((step, i) => {
                        return {
                            ...step,
                            glide: !!state.sequence[(length + i - shift) % length].glide
                        };
                    })
                ]
            };
        }

        case SEQUENCE_SHIFT:
            return {
                ...state,
                sequence: [
                    ...state.sequence.slice(-action.shift),
                    ...state.sequence.slice(0, -action.shift)
                ]
            };

        case INVERT_VALUES:
            return {
                ...state,
                sequence: [
                    ...state.sequence.map(step => ({...step, value: state.maxValue - step.value}))
                ]
            };

        case REVERSE:
            return {
                ...state,
                sequence: [
                    ...state.sequence.slice().reverse().map(step => ({...step}))
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
        case GLIDE_SLOPE_CHANGE:
        case GLIDE_MODE_CHANGE:
        case INVERT_VALUES:
        case MAX_VALUE_DECREASE:
        case MAX_VALUE_INCREASE:
        case REVERSE:
        case SEQUENCE_SHIFT:
        case STEP_ADD:
        case STEP_DELETE:
        case STEP_GLIDE_TOGGLE:
        case STEP_VALUE_CHANGE: {
            const oldStateAtIndex = state[action.index];
            const result = stepSequencer(oldStateAtIndex, action);

            if (result !== oldStateAtIndex) {
                const newState = [
                    ...state
                ];
                newState[action.index] = result;

                return newState;
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
                const oldStateAtIndex = state[action.index];
                const result = modulatorReducer(oldStateAtIndex, action);

                if (result !== oldStateAtIndex) {
                    const newState = [
                        ...state
                    ];
                    newState[action.index] = result;

                    return newState;
                }

                break;
            }

            case SYNC.DENOMINATOR_CHANGE:
            case SYNC.NUMERATOR_CHANGE:
            case SYNC.TOGGLE:
            case SPEED.SPEED_UNIT_CHANGE:
            case SPEED.FREQUENCY_CHANGE: {
                const currentStateAtIndex = state[action.index];
                const currentSpeed = currentStateAtIndex.speed;
                const result = speedReducer(currentSpeed, action);

                if (currentSpeed !== result) {
                    const newState = [
                        ...state
                    ];
                    newState[action.index] = {
                        ...currentStateAtIndex,
                        "speed": result
                    };

                    return newState;
                }

                break;
            }
        }
    }

    return state;
};


export default stepSequencers;
