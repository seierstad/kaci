import {
    FILL_TOGGLE,
    GUIDE_TOGGLE,
    PADDING_CHANGE,
    SHIFT_CHANGE,
    SPEED_UNIT_CHANGE,
    TEXT_CHANGE
} from "./actions";

const dispatchHandlers = (dispatch) => ({
    "speedUnitChange": (module, index, value) => {
        dispatch({"type": SPEED_UNIT_CHANGE, module, index, value});
    },
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
