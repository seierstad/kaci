import blofeldDispatchers from "./blofeld/dispatchers";

const waldorfDispatchers = (dispatch, actionCommons) => ({
    "blofeld": blofeldDispatchers(dispatch, actionCommons)
});

export default waldorfDispatchers;
