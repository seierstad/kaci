import {FUNCTION_CHANGE, PARAMETER_CHANGE} from "./actions";

const waveformDispatchers = (dispatch) => ({
    "functionChange": (value, module, index) => dispatch({"type": FUNCTION_CHANGE, value, module, index}),
    "parameterChange": (value, module, index) => dispatch({"type": PARAMETER_CHANGE, value, module, index})
});

export function getWaveformDispatcherForModule (module, submodule) {
    return (dispatch) => ({
        "functionChange": (value, index = 0) => dispatch({"type": FUNCTION_CHANGE, value, module, index, submodule}),
        "parameterChange": (value, index = 0) => dispatch({"type": PARAMETER_CHANGE, value, module, index, submodule})
    });
}

export default waveformDispatchers;
