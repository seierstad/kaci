import { combineReducers } from "redux";
import patch from "./patch.jsx";
import settings from "./settings.jsx";
import viewState from "./viewState.jsx";
import playState from "./playState.jsx";

const reducer = combineReducers({
    patch,
    settings,
    viewState,
    playState
});

const debugReducer = (state, action) => { // set this as default export to debug
    console.log(state);
    const result = reducer(state, action);
    console.log(result);
    return result;
}
export default reducer;
