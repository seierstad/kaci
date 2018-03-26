import * as Actions from "../actions";
import {defaultMorseParameters} from "../configuration";

import modulatorReducer from "./modulator-reducer";
import syncReducer from "./sync";


const morseGenerator = (state = {...defaultMorseParameters}, action) => {
    switch (action.type) {
        case Actions.MODULATOR_FREQUENCY_CHANGE:
        case Actions.MODULATOR_AMOUNT_CHANGE:
        case Actions.MODULATOR_MODE_CHANGE:
        case Actions.MODULATOR_RESET:
            return modulatorReducer(state, action);

        case Actions.MORSE_TEXT_CHANGE:
            return {
                ...state,
                "text": action.value
            };

        case Actions.MORSE_SPEED_UNIT_CHANGE:
            return {
                ...state,
                "speedUnit": action.value
            };

        case Actions.MORSE_PADDING_CHANGE:
            return {
                ...state,
                "padding": action.value
            };

        case Actions.MORSE_FILL_TOGGLE:
            return {
                ...state,
                "fillToFit": !state.fillToFit
            };

        case Actions.MORSE_SHIFT_CHANGE:
            return {
                ...state,
                "shift": action.value
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
            case Actions.MODULATOR_AMOUNT_CHANGE:
            case Actions.MODULATOR_FREQUENCY_CHANGE:
            case Actions.MODULATOR_MODE_CHANGE:
            case Actions.MODULATOR_RESET:
            case Actions.MORSE_FILL_TOGGLE:
            case Actions.MORSE_PADDING_CHANGE:
            case Actions.MORSE_SHIFT_CHANGE:
            case Actions.MORSE_SPEED_UNIT_CHANGE:
            case Actions.MORSE_TEXT_CHANGE:
            case Actions.SYNC_DENOMINATOR_CHANGE:
            case Actions.SYNC_NUMERATOR_CHANGE:
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
