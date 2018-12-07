import {combineReducers} from "redux";
import {
    ENVELOPE_BLUR,
    ENVELOPE_POINT_ADD,
    ENVELOPE_POINT_EDIT_END,
    ENVELOPE_POINT_EDIT_START
} from "../envelope/actions";
import * as Actions from "../actions";

import {envelope, envelopes} from "../envelope/viewstate-reducers";


const harmonics = (state = {}, action) => {
    if (action.submodule === "harmonics") {
        const {type} = action;

        switch (type) {
            case Actions.HARMONIC_NEW:

                return {
                    "newHarmonic": {
                        "denominator": 1,
                        "enabled": true,
                        "numerator": 1
                    }
                };

            case Actions.HARMONIC_NUMERATOR_CHANGE:
                return {
                    ...state,
                    "newHarmonic": {
                        ...(state.newHarmonic),
                        "numerator": action.value
                    }
                };

            case Actions.HARMONIC_DENOMINATOR_CHANGE:
                return {
                    ...state,
                    "newHarmonic": {
                        ...(state.newHarmonic),
                        "denominator": action.value
                    }
                };

            case Actions.HARMONIC_ADD:
                const {newHarmonic, ...rest} = state;

                return {
                    ...rest
                };
        }
    }

    return state;
};

const oscillator = (state = {"pd": [[], []]}, action) => {
    if (action.module === "oscillator") {

        if (action.hasOwnProperty("envelopeIndex")) {

            switch (action.type) {

                case ENVELOPE_POINT_ADD:
                case ENVELOPE_BLUR:
                case ENVELOPE_POINT_EDIT_START:
                case ENVELOPE_POINT_EDIT_END:
                    const pd = [...state.pd];
                    pd[action.envelopeIndex] = envelope([...state.pd[action.envelopeIndex]], action);

                    return {
                        ...state,
                        pd
                    };
            }

        } else if (action.submodule === "harmonics") {

            switch (action.type) {

                case Actions.HARMONIC_NEW:
                case Actions.HARMONIC_ADD:
                case Actions.HARMONIC_DENOMINATOR_CHANGE:
                case Actions.HARMONIC_NUMERATOR_CHANGE:

                    return {
                        ...state,
                        harmonics: harmonics(state.harmonics, action)
                    };
            }
        }
    }


    return state;
};

const morseGen = (state = {"guides": []}, action) => {
    switch (action.type) {
        case Actions.MORSE_GUIDE_TOGGLE:
            const index = state.guides.indexOf(action.value);

            if (~index) {
                return {
                    ...state,
                    "guides": [
                        ...state.guides.slice(0, index),
                        ...state.guides.slice(index + 1)
                    ]
                };
            }

            return {
                ...state,
                "guides": [
                    ...state.guides,
                    action.value
                ]
            };
    }

    return state;
};

const morse = (state = [], action) => {
    if (action.module === "morse") {
        switch (action.type) {
            case Actions.MORSE_GUIDE_TOGGLE:

                return [
                    ...state.slice(0, action.index),
                    morseGen(state[action.index], action),
                    ...state.slice(action.index + 1)
                ];
        }
    }

    return state;
};

const viewState = combineReducers({
    envelopes,
    oscillator,
    morse
});

export default viewState;
