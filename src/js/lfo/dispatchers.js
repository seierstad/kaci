import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import {getModulatorDispatcherForModule} from "../modulator/dispatchers";
import {getWaveformDispatcherForModule} from "../waveform/dispatchers";

const lfoSpeedDispatchers = getSpeedDispatcherForModule("lfos");
const lfoWaveformDispatchers = getWaveformDispatcherForModule("lfos");
const lfoModulatorDispatchers = getModulatorDispatcherForModule("lfos");

const lfoDispatcher = (dispatch) => ({
    ...(lfoModulatorDispatchers(dispatch)),
    "speed": lfoSpeedDispatchers(dispatch),
    "waveform": lfoWaveformDispatchers(dispatch)
});


export default lfoDispatcher;
