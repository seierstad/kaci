import {
    CHANGE_RATE,
    PARAMETER_CHANGE,
    TOGGLE,
    WAVE_COUNT_CHANGE,
    WAVE_LENGTH_CHANGE
} from "./actions";

const actionCommons = {
    "module": "oscillator",
    "submodule": "wavetable-generator"
};

const waveformGeneratorDispatcher = (dispatch) => ({
    "toggle": (parameters, patch) => dispatch({
        ...actionCommons,
        "type": TOGGLE,
        parameters,
        patch
    }),
    "changeParameter": (parameter, value, patch) => dispatch({
        ...actionCommons,
        "type": PARAMETER_CHANGE,
        parameter,
        patch,
        value
    }),
    "changeChangeRate": (parameter, value, patch) => dispatch({
        ...actionCommons,
        "type": CHANGE_RATE,
        parameter,
        patch,
        value
    }),
    "changeWaveCount": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": WAVE_COUNT_CHANGE,
        value
    }),
    "changeWaveLength": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": WAVE_LENGTH_CHANGE,
        value
    })
});


export default waveformGeneratorDispatcher;
