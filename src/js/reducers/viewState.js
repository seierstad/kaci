import {combineReducers} from "redux";

import morse from "../morse/reducer-viewstate";
import oscillator from "../oscillator/viewstate-reducer";
import {envelopes} from "../envelope/viewstate-reducers";
import steps from "../steps/reducer-viewstate";

const viewState = combineReducers({
    envelopes,
    oscillator,
    morse,
    steps
});

export default viewState;
