import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";

const nullReducer = (state = {}, action) => {
    return state;
};
const oscillator = nullReducer;
const sub = nullReducer;
const lfo = nullReducer;
const envelope = nullReducer;
const modulation = nullReducer;

const noise = (state = {}, action) => {
    console.log(state);
    console.log(action.type + ": " + action.value);
    switch (action.type) {
        case Actions.NOISE_GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };
        case Actions.NOISE_PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };
        default:
            return state;
    }
};

const patch = combineReducers({
    oscillator,
    noise,
    sub,
    lfo,
    envelope,
    modulation
});

export default patch;
