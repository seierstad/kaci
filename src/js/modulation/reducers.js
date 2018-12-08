
import config from "../configuration";
import {splicedArrayCopy} from "../shared-functions";

import {
    AMOUNT_CHANGE,
    CONNECTION_TOGGLE,
    POLARITY_CHANGE
} from "./actions";


const connection = (state = {...config.modulation.connection["default"]}, action) => {
    const result = {...state};

    if (!result.source && action.source && typeof action.index === "number") {
        const {source: type, index} = action;
        result.source = {type, index};
    }

    switch (action.type) {
        case CONNECTION_TOGGLE:
            return {
                ...result,
                "enabled": !state.enabled
            };
        case POLARITY_CHANGE:
            return {
                ...result,
                "polarity": action.value
            };
        case AMOUNT_CHANGE:
            return {
                ...result,
                "amount": action.value
            };
    }
    return state;
};

const parameter = (state = [], action) => {
    const result = [...state];

    if (action.type === CONNECTION_TOGGLE && action.source === "env") {
        // disable all envelopes if envelope toggle
        result.filter(c => c.source.type === "env").forEach(c => c.enabled = false);
    }

    switch (action.type) {
        case CONNECTION_TOGGLE:
        case POLARITY_CHANGE:
        case AMOUNT_CHANGE:
            let index = Number.POSITIVE_INFINITY;
            const connectionState = state.find((element, idx) => {
                if (element.source.type === action.source && element.source.index === action.index) {
                    index = idx;
                    return true;
                }
            });
            return splicedArrayCopy(result, index, 1, connection(connectionState, action));
    }
    return state;
};


const moduleReducer = (state = {}, action) => {
    switch (action.type) {
        case CONNECTION_TOGGLE:
        case POLARITY_CHANGE:
        case AMOUNT_CHANGE:
            return {
                ...state,
                [action.parameter]: parameter(state[action.parameter], action)
            };
    }
    return state;
};

const modulation = (state = {}, action) => {
    switch (action.type) {
        case CONNECTION_TOGGLE:
        case POLARITY_CHANGE:
        case AMOUNT_CHANGE:
            return {
                ...state,
                [action.module]: moduleReducer(state[action.module], action)
            };
    }
    return state;
};


export default modulation;
