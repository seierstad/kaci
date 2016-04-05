import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";
import envelope from "./envelope.jsx";

const nullReducer = (state = {}, action) => {
    return state;
};
const oscillator = nullReducer;
const lfo = nullReducer;
const modulation = nullReducer;

const noise = (state = {}, action) => {
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
        case Actions.NOISE_TOGGLE:
            return {
                ...state,
                active: !state.active
            };
        default:
            return state;
    }
};

const sub = (state = {}, action) => {
    switch (action.type) {
        case Actions.SUB_GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };
        case Actions.SUB_PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };
        case Actions.SUB_TOGGLE:
            return {
                ...state,
                active: !state.active
            };
        case Actions.SUB_DEPTH_CHANGE:
            return {
                ...state,
                depth: action.value
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
