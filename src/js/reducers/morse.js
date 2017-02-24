import * as Actions from "../actions";
import {defaultMorseParameters} from "../configuration";

import syncReducer from "./sync";


const morseGenerator = (state = {...defaultMorseParameters}, action) => {
    switch (action.type) {
        case Actions.MODULATOR_FREQUENCY_CHANGE:
            return {
                ...state,
                "frequency": action.value
            };

        case Actions.MODULATOR_AMOUNT_CHANGE:
            return {
                ...state,
                "amount": action.value
            };

        case Actions.MODULATOR_RESET:
            // possible implementation: timestamp in the viewState?
            return state;

        case Actions.MORSE_TEXT_CHANGE:
            return {
                ...state,
                "text": action.value
            };

        case Actions.SYNC_NUMERATOR_CHANGE:
        case Actions.SYNC_DENOMINATOR_CHANGE:
        case Actions.SYNC_TOGGLE:
            return {
                ...state,
                "sync": syncReducer(state.sync, action)
            };
    }

    return state;
};

const morse = (state = [], action) => {

    if (action.module === "morse") {

        switch (action.type) {
            case Actions.MODULATOR_FREQUENCY_CHANGE:
            case Actions.MODULATOR_AMOUNT_CHANGE:
            case Actions.MODULATOR_RESET:
            case Actions.MORSE_TEXT_CHANGE:
            case Actions.SYNC_NUMERATOR_CHANGE:
            case Actions.SYNC_DENOMINATOR_CHANGE:
            case Actions.SYNC_TOGGLE:

                const result = [
                    ...state
                ];
                result[action.index] = morseGenerator(state[action.index], action);

                return result;
        }
    }

    return state;
};


export default morse;
