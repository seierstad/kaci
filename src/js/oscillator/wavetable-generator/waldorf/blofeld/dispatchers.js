import {
    NAME_CHANGE,
    SLOT_CHANGE,
    DEVICE_ID_CHANGE
} from "./actions.js";

const blofeldDispatchers = (dispatch, actionCommons) => ({
    "changeName": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": NAME_CHANGE,
        value
    }),
    "changeSlot": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": SLOT_CHANGE,
        value
    }),
    "changeDeviceID": (value, patch) => dispatch({
        ...actionCommons,
        patch,
        "type": DEVICE_ID_CHANGE,
        value
    })
});

export default blofeldDispatchers;
