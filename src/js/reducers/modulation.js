import * as Actions from "../actions";
import { combineReducers } from "redux";
import config from "../configuration.json";


const connection = (state = {...config.modulation.connection["default"]}, action) => {

    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
            return {
                ...state,
                "enabled": !state.enabled
            };
        case Actions.MODULATION_POLARITY_CHANGE:
            return {
                ...state,
                "polarity": action.value
            };
        case Actions.MODULATION_AMOUNT_CHANGE:
            return {
                ...state,
                "amount": action.value
            };
    }
    return state;
};

/*
const envelopes = (state = [], action) => {
    const {type, sourceType, index} = action;

    if (sourceType === "envelope") {
        switch (type) {
            case Actions.MODULATION_CONNECTION_TOGGLE:
                let result = [...state];
                const target = action.module + "." + action.parameter;


                result.forEach((envelope, i) => {
                    Object.keys(envelope).forEach(t => {
                        if (t === target) {
                            result[i][t] = {...state[i][t], "enabled": false};
                        }
                    });
                });

                if (action.index === null) {
                    return result;
                }

                result[action.index] = modulator(state[action.index], action);
                return result;

            case Actions.MODULATION_POLARITY_CHANGE:
            case Actions.MODULATION_AMOUNT_CHANGE:
                return {
                    ...state,
                    [action.index]: modulator(state[action.index], action)
                };
        }
    }
    return state;
};
*/

const parameter = (state = [], action) => {
    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
        case Actions.MODULATION_POLARITY_CHANGE:
        case Actions.MODULATION_AMOUNT_CHANGE:
            let index;
            const connectionState = state.find((element, idx) => {
                if (element.source.type === action.sourceType && element.source.index === action.index) {
                    index = idx;
                    return true;
                }
            });
            const newState = connection(connectionState, action);
            const result = state.map((curr, idx, arr) => {
                if (curr.source.type === action.sourceType && curr.source.index === action.index) {
                    return connection(curr, action);
                }
                return curr;
            });
    }
    return state;
};


const module = (state = {}, action) => {
    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
        case Actions.MODULATION_POLARITY_CHANGE:
        case Actions.MODULATION_AMOUNT_CHANGE:
            return {
                ...state,
                [action.parameter]: parameter(state[action.parameter], action)
            };
    }
    return state;
};

const modulation = (state = {}, action) => {
    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
        case Actions.MODULATION_POLARITY_CHANGE:
        case Actions.MODULATION_AMOUNT_CHANGE:
            return {
                ...state,
                [action.module]: module(state[action.module], action)
            };
    }
    return state;
};


export default modulation;
