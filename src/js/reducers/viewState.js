import {combineReducers} from "redux";

import morse from "../morse/reducer-viewstate";
import oscillator from "../oscillator/viewstate-reducer";
import {envelopes} from "../envelope/viewstate-reducers";


const viewState = combineReducers({
    envelopes,
    oscillator,
    morse
});

export default viewState;
