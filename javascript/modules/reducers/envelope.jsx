import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";

const deletePoint = (arr, index) => {
    if (index > 0 && index < arr.length - 1) {
        return [
            ...arr.slice(0, index), 
            ...arr.slice(index + 1)
        ];
    }
    return arr;
};

const steps = (state = [], action) => {
    const sortByX = (a, b) => a[0] > b[0];

    switch (action.type) {
        case Actions.ENVELOPE_POINT_DELETE:
            return deletePoint([...state], action.index);
        case Actions.ENVELOPE_POINT_ADD:
            return [...state, [action.x, action.y]].sort(sortByX);
        case Actions.ENVELOPE_POINT_CHANGE:
            return [
                ...state.slice(0, action.index),
                [action.x, action.y],
                ...state.slice(action.index + 1)
            ];
    }
    return state;
};


const duration = (state = 0, action) => {
    if (action.type === Actions.ENVELOPE_DURATION_CHANGE) {
        return action.value;
    }
    return state;
};
const envelopePart = combineReducers({
    steps,
    duration
});

const sustainedEnvelope = (state = {}, action) => {
    if (action.type === Actions.ENVELOPE_MODE_CHANGE) {
        return {
            ...state,
            mode: action.value
        };
    }
    switch (action.envelopePart) {
        case "attack":
            return {
                ...state,
                attack: envelopePart(state.attack, action)
            };
        case "release":
            return {
                ...state,
                release: envelopePart(state.release, action)
            };
    }
    return state;
};

const envelope = (state = {}, action) => {
    const index = action.envelopeIndex;

    let result = [
        ...state
    ];
    result[index] = sustainedEnvelope(state[index], action);

    return result;
};

export default envelope;