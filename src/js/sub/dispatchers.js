import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import {getOutputDispatcherForModule} from "../output-stage/dispatchers";
import {
    DEPTH_CHANGE,
    DETUNE_CHANGE,
    DETUNE_MODE_CHANGE
} from "./actions";


const subOutputDispatchers = getOutputDispatcherForModule("sub");
const subSpeedDispatchers = getSpeedDispatcherForModule("sub");

const subDispatchers = (dispatch) => ({
    "beat": subSpeedDispatchers(dispatch),
    "depthChange": (value) => dispatch({"type": DEPTH_CHANGE, value}),
    "detuneChange": (value) => dispatch({"type": DETUNE_CHANGE, value}),
    "detuneModeChange": (value) => dispatch({"type": DETUNE_MODE_CHANGE, value}),
    "outputStageHandlers": subOutputDispatchers(dispatch)
});


export default subDispatchers;
