import {getSpeedDispatcherForModule} from "../speed/dispatchers";
import {getModulatorDispatcherForModule} from "../modulator/dispatchers";

import {
    FILL_TOGGLE,
    GUIDE_TOGGLE,
    PADDING_CHANGE,
    SHIFT_CHANGE,
    TEXT_CHANGE
} from "./actions";


const modulatorDispatcher = getModulatorDispatcherForModule("morse");
const speedDispatcher = getSpeedDispatcherForModule("morse");

const dispatchHandlers = (dispatch) => ({
    ...(modulatorDispatcher(dispatch)),
    "speed": speedDispatcher(dispatch),
    "paddingChange": (value, index) => {
        dispatch({"type": PADDING_CHANGE, "module": "morse", index, value});
    },
    "shiftChange": (value, index) => {
        dispatch({"type": SHIFT_CHANGE, "module": "morse", index, value});
    },
    "toggleFillToFit": (value, index) => {
        dispatch({"type": FILL_TOGGLE, "module": "morse", index, value});
    },
    "textChange": (value, index) => {
        dispatch({"type": TEXT_CHANGE, "module": "morse", index, value});
    },
    "toggleGuide": (value, index) => {
        dispatch({"type": GUIDE_TOGGLE, "module": "morse", index, value});
    }
});

export default dispatchHandlers;
