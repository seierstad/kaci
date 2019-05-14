import syncDispatcher, {
    dispatcherForModule as getSyncDispatcherForModule
} from "./sync/dispatchers";

import {
    FREQUENCY_CHANGE,
    SPEED_UNIT_CHANGE
} from "./actions";


const dispatchHandlers = dispatch => ({
    "frequencyChange": (value, index, module) => {
        dispatch({"type": FREQUENCY_CHANGE, module, index, value});
    },
    "speedUnitChange": (value, index, module) => {
        dispatch({"type": SPEED_UNIT_CHANGE, module, index, value});
    },
    "sync": syncDispatcher(dispatch)
});

export const getSpeedDispatcherForModule = module => {
    const syncDispatcher = getSyncDispatcherForModule(module);

    const dispatcher = dispatch => ({
        "frequencyChange": (value, index) => {
            dispatch({"type": FREQUENCY_CHANGE, module, index, value});
        },
        "speedUnitChange": (value, index) => {
            dispatch({"type": SPEED_UNIT_CHANGE, module, index, value});
        },
        "sync": syncDispatcher(dispatch)
    });

    return dispatcher;
};

export default dispatchHandlers;
