import {getOutputDispatcherForModule} from "../output-stage/dispatchers";
import {
    COLOR_CHANGE
} from "./actions";


const noiseOutputDispatchers = getOutputDispatcherForModule("noise");

const noiseDispatchers = (dispatch) => ({
    "outputHandlers": noiseOutputDispatchers(dispatch),
    "colorChange": (value) => {
        dispatch({type: COLOR_CHANGE, value});
    }
});


export default noiseDispatchers;
