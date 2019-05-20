import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import modulatorHandlers from "../modulator/dispatchers";
import {getWaveformDispatcherForModule} from "../waveform/dispatchers";

const lfoSpeedDispatchers = getSpeedDispatcherForModule("lfos");
const lfoWaveformDispatchers = getWaveformDispatcherForModule("lfos");

const lfoDispatcher = (dispatch) => ({
    ...(modulatorHandlers(dispatch)),
    "speed": lfoSpeedDispatchers(dispatch),
    "waveform": lfoWaveformDispatchers(dispatch)
});


export default lfoDispatcher;
