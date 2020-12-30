import {getOutputDispatcherForModule} from "../output-stage/dispatchers";
import {getWaveformDispatcherForModule} from "../waveform/dispatchers";
import {
    DETUNE_CHANGE,
    MIX_CHANGE,
    MODE_CHANGE,
    RESONANCE_FACTOR_CHANGE,
    RESONANCE_TOGGLE
} from "./actions";
import harmonicDispatchers from "./harmonics/dispatchers";
import wavetableGeneratorHandlers from "./wavetable-generator/dispatchers";

const waveformHandlers = getWaveformDispatcherForModule("oscillator", "waveform");
const wrapperHandlers = getWaveformDispatcherForModule("oscillator", "wrapper");
const outputDispatchers = getOutputDispatcherForModule("oscillator");

const oscDispatcher = (dispatch) => ({
    "resonance": {
        "factorChange": (value) => dispatch({type: RESONANCE_FACTOR_CHANGE, value}),
        "toggle": () => dispatch({"type": RESONANCE_TOGGLE}),
        "wrapper": wrapperHandlers(dispatch)
    },
    "harmonics": harmonicDispatchers(dispatch),
    "outputStageHandlers": outputDispatchers(dispatch),
    "mode": (mode) => dispatch({type: MODE_CHANGE, mode}),
    "waveform": waveformHandlers(dispatch),
    "mix": (value) => dispatch({"type": MIX_CHANGE, value}),
    "detune": (value) => dispatch({"type": DETUNE_CHANGE, value}),
    "wavetableGenerator": wavetableGeneratorHandlers(dispatch)
});


export default oscDispatcher;
