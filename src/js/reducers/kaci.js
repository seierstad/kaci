import { combineReducers } from "redux";
import patch from "./patch";
import settings from "./settings";
import viewState from "./viewState";
import playState from "./playState";

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
};

export default reducer;
