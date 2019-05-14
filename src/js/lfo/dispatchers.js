import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import modulatorHandlers from "../modulator/dispatchers";
import {WAVEFORM_CHANGE} from "./actions";

const lfoSpeedDispatchers = getSpeedDispatcherForModule("lfos");

const lfoDispatcher = (dispatch) => ({
    ...(modulatorHandlers(dispatch)),
    "speed": lfoSpeedDispatchers(dispatch),
    "changeWaveform": (module, index, value) => {
        dispatch({"type": WAVEFORM_CHANGE, module, index, value});
    }
});


export default lfoDispatcher;
