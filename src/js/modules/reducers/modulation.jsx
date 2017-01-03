import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";
import config from "../../configuration.json";

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
                            result[i][t] = {...state[i][t], "enabled": false}
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
}

const modulator = (state = {}, action) => {
    switch (action.type) {
        case Actions.MODULATION_CONNECTION_TOGGLE:
        case Actions.MODULATION_POLARITY_CHANGE:
        case Actions.MODULATION_AMOUNT_CHANGE:

            const target = action.module + "." + action.parameter;

            return {
                ...state,
                [target]: connection(state[target], action)
            };
    }
    return state;
}

const lfos = (state = new Array(config.modulation.source.lfos.count), action) => {
    if (action.sourceType === "lfo") {

        switch (action.type) {
            case Actions.MODULATION_CONNECTION_TOGGLE:
            case Actions.MODULATION_POLARITY_CHANGE:
            case Actions.MODULATION_AMOUNT_CHANGE:

                const result = [...state];
                result[action.index] = modulator(state[action.index], action);
                return result;
        }
    }
    return state;
}

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
}

const modulation = combineReducers({
    envelopes,
    lfos
});

export default modulation;