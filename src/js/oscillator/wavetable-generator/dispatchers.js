import {
    PARAMETER,
    PARAMETER_CHANGE_RATE,
    TYPE,
    TOGGLE,
    WAVE_COUNT,
    WAVE_LENGTH,
    SELECT_WAVE_INDEX
} from "./actions";

import audiofileDispatchers from "./audiofile/dispatchers.js";
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
    "changeType": (value, patch) => {
        const [model, manufacturer] = value.split("-");
        dispatch({
            ...actionCommons,
            model,
            manufacturer,
            "type": TYPE,
            patch,
            value
        });
    },
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
    "selectWaveIndex": (value, patch) => dispatch({
        ...actionCommons,
        "type": SELECT_WAVE_INDEX,
        value,
        patch
    }),
    "audiofile": audiofileDispatchers(dispatch, actionCommons),
    "waldorf": waldorfDispatchers(dispatch, actionCommons)
});


export default wavetableGeneratorDispatcher;
