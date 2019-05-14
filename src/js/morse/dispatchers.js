import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import modulatorHandlers from "../modulator/dispatchers";

import {
    FILL_TOGGLE,
    GUIDE_TOGGLE,
    PADDING_CHANGE,
    SHIFT_CHANGE,
    TEXT_CHANGE
} from "./actions";

const speedDispatcher = getSpeedDispatcherForModule("morse");

const dispatchHandlers = (dispatch) => ({
    ...(modulatorHandlers(dispatch)),
    "speed": speedDispatcher(dispatch),
    "paddingChange": (module, index, value) => {
        dispatch({"type": PADDING_CHANGE, module, index, value});
    },
    "shiftChange": (module, index, value) => {
        dispatch({"type": SHIFT_CHANGE, module, index, value});
    },
    "toggleFillToFit": (module, index, value) => {
        dispatch({"type": FILL_TOGGLE, module, index, value});
    },
    "textChange": (module, index, value) => {
        dispatch({"type": TEXT_CHANGE, module, index, value});
    },
    "toggleGuide": (module, index, value) => {
        dispatch({"type": GUIDE_TOGGLE, module, index, value});
    }
});

export default dispatchHandlers;
