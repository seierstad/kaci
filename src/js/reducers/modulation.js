import * as Actions from "../actions";
import config from "../configuration";
import {splicedArrayCopy} from "../sharedFunctions";

const connection = (state = {...config.modulation.connection["default"]}, action) => {
    const result = {...state};

    if (!result.source && action.source && typeof action.index === "number") {
        const {source: type, index} = action;
        result.source = {type, index};
    }

    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
            return {
                ...result,
                "enabled": !state.enabled
            };
        case Actions.MODULATION_POLARITY_CHANGE:
            return {
                ...result,
                "polarity": action.value
            };
        case Actions.MODULATION_AMOUNT_CHANGE:
            return {
                ...result,
                "amount": action.value
            };
    }
    return state;
};

/*
const envelopes = (state = [], action) => {
    const {type, source, index} = action;

    if (source === "envelope") {
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
    const result = [...state];

    if (action.type === Actions.MODULATION_CONNECTION_TOGGLE && action.source === "env") {
        // disable all envelopes if envelope toggle
        result.filter(c => c.source.type === "env").forEach(c => c.enabled = false);
    }

    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
        case Actions.MODULATION_POLARITY_CHANGE:
        case Actions.MODULATION_AMOUNT_CHANGE:
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
