"use strict";

import wavDispatchers from "./wav/dispatchers.js";


const audioFileDispatchers = (dispatch, actionCommons) => ({
    "wav": wavDispatchers(dispatch, actionCommons)
});

export default audioFileDispatchers;
