import * as SYNC from "../sync/actions";
import syncReducer from "../sync/reducers";
import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";

import defaultMorseParameters from "./defaults";
import * as MORSE from "./actions";


const morseGenerator = (state = {...defaultMorseParameters}, action) => {
    switch (action.type) {
        case MORSE.TEXT_CHANGE:
            return {
                ...state,
                "text": action.value
            };

        case MORSE.SPEED_UNIT_CHANGE:
            return {
                ...state,
                "speedUnit": action.value
            };

        case MORSE.PADDING_CHANGE:
            return {
                ...state,
                "padding": action.value
            };

        case MORSE.FILL_TOGGLE:
            return {
                ...state,
                "fillToFit": !state.fillToFit
            };

        case MORSE.SHIFT_CHANGE:
            return {
                ...state,
                "shift": action.value
            };
    }

    return state;
};

const morse = (state = [], action) => {

    if (action.module === "morse") {
        const result = [
            ...state
        ];

        switch (action.type) {
            case MODULATOR.AMOUNT_CHANGE:
            case MODULATOR.FREQUENCY_CHANGE:
            case MODULATOR.MODE_CHANGE:
            case MODULATOR.RESET:
                result[action.index] = modulatorReducer(state, action);
                break;

            case SYNC.DENOMINATOR_CHANGE:
            case SYNC.NUMERATOR_CHANGE:
            case SYNC.TOGGLE:
                result[action.index] = {
                    ...result[action.index],
                    "sync": syncReducer(result[action.index].sync, action)
                };
                break;

            case MORSE.FILL_TOGGLE:
            case MORSE.PADDING_CHANGE:
            case MORSE.SHIFT_CHANGE:
            case MORSE.SPEED_UNIT_CHANGE:
            case MORSE.TEXT_CHANGE:
                result[action.index] = morseGenerator(state[action.index], action);
                break;
        }

        return result;
    }

    return state;
};


export default morse;
