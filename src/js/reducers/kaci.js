import {combineReducers} from "redux";
import patch from "../patch/reducer";
import settings from "../settings/reducers";
import playState from "../play-state/reducers";
import viewState from "./viewState";


const reducer = combineReducers({
    patch,
    settings,
    viewState,
    playState
});


export default reducer;
