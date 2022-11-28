import {
    PARAMETER,
    PARAMETER_CHANGE_RATE,
    TYPE,
    TOGGLE,
    WAVE_COUNT,
    WAVE_LENGTH
} from "./actions";

import waldorfDispatchers from "./waldorf/dispatchers.js";

const actionCommons = {
    "module": "oscillator",
    "submodule": "wavetable-generator"
};

const wavetableGeneratorDispatcher = (dispatch) => ({
    "toggle": (parameters, patch) => dispatch({
        ...actionCommons,
        "type": TOGGLE,
        parameters,
        patch
    }),
    "changeType": (value, patch) => dispatch({
        ...actionCommons,
        "type": TYPE,
        patch,
        value
    }),
    "changeParameter": (parameter, value, patch) => dispatch({
        ...actionCommons,
        "type": PARAMETER,
        parameter,
        patch,
        value
    }),
    "changeChangeRate": (parameter, value, patch) => dispatch({
        ...actionCommons,
        "type": PARAMETER_CHANGE_RATE,
        parameter,
        patch,
        value
    }),
    "changeWaveCount": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": WAVE_COUNT,
        value
    }),
    "changeWaveLength": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": WAVE_LENGTH,
        value
    }),
    "waldorf": waldorfDispatchers(dispatch, actionCommons)
});


export default wavetableGeneratorDispatcher;
