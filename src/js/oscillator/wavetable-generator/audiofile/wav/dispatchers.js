"use strict";

import {
    FILENAME_CHANGE,
    SAMPLERATE_CHANGE,
    RESOLUTION_CHANGE
} from "./actions.js";


const wavDispatchers = (dispatch, actionCommons) => ({
    "changeResolution": (value, patch) => dispatch({
        ...actionCommons,
        "type": RESOLUTION_CHANGE,
        patch,
        value
    }),
    "changeSamplerate": (value, patch) => dispatch({
        ...actionCommons,
        "type": SAMPLERATE_CHANGE,
        patch,
        value
    }),
    "changeFilename": (value, patch) => dispatch({
        ...actionCommons,
        "type": FILENAME_CHANGE,
        patch,
        value
    })
});

export default wavDispatchers;
