import {
    TOGGLE,
    PAN_CHANGE,
    GAIN_CHANGE
} from "./actions";

const dispatchHandlers = dispatch => ({
    "handleToggle": () => {
        dispatch({"type": TOGGLE, module});
    },
    "handlePanInput": (value) => {
        dispatch({"type": PAN_CHANGE, module, value});
    },
    "handleGainInput": (value) => {
        dispatch({"type": GAIN_CHANGE, module, value});
    }
});


export const getOutputDispatcherForModule = module => dispatch => ({
    "handleToggle": () => {
        dispatch({"type": TOGGLE, module});
    },
    "handlePanInput": (value) => {
        dispatch({"type": PAN_CHANGE, module, value});
    },
    "handleGainInput": (value) => {
        dispatch({"type": GAIN_CHANGE, module, value});
    }
});

export default dispatchHandlers;
