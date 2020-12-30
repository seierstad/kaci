import {
    AMOUNT_CHANGE,
    MODE_CHANGE,
    RESET
} from "./actions";

const dispatchHandlers = (dispatch) => ({
    "reset": (event, module, index) => {
        dispatch({"type": RESET, module, index});
    },
    "amountChange": (value, module, index) => {
        dispatch({"type": AMOUNT_CHANGE, index, module, value});
    },
    "modeChange": (value, module, index) => {
        dispatch({"type": MODE_CHANGE, value, module, index});
    }
});

export const getModulatorDispatcherForModule = module => dispatch => ({
    "reset": (event, index) => {
        dispatch({"type": RESET, module, index});
    },
    "amountChange": (value, index) => {
        dispatch({"type": AMOUNT_CHANGE, index, module, value});
    },
    "modeChange": (value, index) => {
        dispatch({"type": MODE_CHANGE, value, module, index});
    }
});

export default dispatchHandlers;
