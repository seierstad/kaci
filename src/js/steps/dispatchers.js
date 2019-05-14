import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import modulatorHandlers from "../modulator/dispatchers";

import {
    GENERATE_SEQUENCE,
    GENERATOR_SELECT,
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

const stepsSpeedDispatchers = getSpeedDispatcherForModule("steps");


const dispatchHandlers = (dispatch) => ({
    ...(modulatorHandlers(dispatch)),
    "speed": stepsSpeedDispatchers(dispatch),
    "addStep": index => {
        dispatch({"type": STEP_ADD, index});
    },
    "deleteStep": (index, step) => {
        dispatch({"type": STEP_DELETE, index, step});
    },
    "stepValueChange": (index, step, value) => {
        dispatch({"type": STEP_VALUE_CHANGE, index, step, value});
    },
    "stepGlideToggle": (index, step) => {
        dispatch({"type": STEP_GLIDE_TOGGLE, index, step});
    },
    "increaseLevelCount": index => {
        dispatch({"type": MAX_VALUE_INCREASE, index});
    },
    "decreaseLevelCount": index => {
        dispatch({"type": MAX_VALUE_DECREASE, index});
    },
    "sequenceShift": (index, shift) => dispatch({"type": SEQUENCE_SHIFT, index, shift}),
    "glide": {
        "changeGlideTime": (index, value, direction = "both") => dispatch({"type": GLIDE_TIME_CHANGE, index, value, direction}),
        "changeGlideSlope": (index, value, direction = "both") => dispatch({"type": GLIDE_SLOPE_CHANGE, index, value, direction}),
        "changeGlideMode": (index, value) => dispatch({"type": GLIDE_MODE_CHANGE, value}),
        "glideNoSteps": index => dispatch({"type": GLIDE_NONE, index}),
        "glideAtEvery": (index, interval = 1) => dispatch({"type": GLIDE_AT_EVERY, index, interval}),
        "glideAtRising": (index, interval = 1, enable = true) => dispatch({"type": GLIDE_AT_RISING, index, enable, interval}),
        "glideAtFalling": (index, interval = 1, enable = true) => dispatch({"type": GLIDE_AT_FALLING, index, enable, interval}),
        "glideAtChange": (index, interval = 1, enable = true) => dispatch({"type": GLIDE_AT_CHANGE, index, enable, interval}),
        "glideShift": (index, shift) => dispatch({"type": GLIDE_SHIFT, index, shift}),
        "invertSteps": index => dispatch({"type": GLIDE_INVERT, index})
    },
    "invertValues": index => dispatch({"type": INVERT_VALUES, index}),
    "reverse": index => dispatch({"type": REVERSE, index}),
    "selectGenerator": (index, generatorName) => dispatch({"type": GENERATOR_SELECT, index, generatorName}),
    "generateSequence": (index, generatorName, generatorParameters, normalize) => dispatch({
        "type": GENERATE_SEQUENCE,
        index,
        generatorName,
        generatorParameters,
        normalize
    })
});

export default dispatchHandlers;
