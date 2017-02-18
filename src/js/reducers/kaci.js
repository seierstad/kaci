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


export default reducer;
