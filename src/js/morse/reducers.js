import speedReducer from "../speed/reducer";
import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";

import {defaultMorseParameters} from "./defaults";
import * as MORSE from "./actions";


const morseGenerator = (state = {...defaultMorseParameters}, action) => {

    switch (action.type) {
        case MORSE.TEXT_CHANGE:
            if (action.value !== state.text) {
                return {
                    ...state,
                    "text": action.value
                };
            }
            break;

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

        case MODULATOR.AMOUNT_CHANGE:
        case MODULATOR.MODE_CHANGE:
        case MODULATOR.RESET:
            return modulatorReducer(state, action);
    }

    const newSpeed = speedReducer(state.speed, action);
    if (newSpeed !== state.speed) {
        return {
            ...state,
            speed: newSpeed
        };
    }

    return state;
};

const morse = (state = [], action) => {

    if (action.module === "morse") {
        const currentState = state[action.index];
        let result = morseGenerator(currentState, action);

        if (result !== currentState) {
            const newState = [
                ...state
            ];
            newState[action.index] = result;

            return newState;
        }
    }

    return state;
};


export default morse;
