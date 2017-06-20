import {combineReducers} from "redux";

import * as Actions from "../actions";
import config from "../configuration";


const envelope = (state = [], action) => {
    switch (action.type) {
        case Actions.ENVELOPE_POINT_ADD:
            return [
                ...state.map(el => (el >= action.index ? el + 1 : el)),
                action.index
            ];
        case Actions.ENVELOPE_BLUR:
            return [];
        case Actions.ENVELOPE_POINT_EDIT_START:
            if (state.indexOf(action.index) === -1) {
                return [...state, action.index];
            }
            break;
        case Actions.ENVELOPE_POINT_EDIT_END:
            const index = state.indexOf(action.index);
            if (index !== -1) {
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)
                ];
            }
            break;

    }
    return state;
};

const sustainedEnvelope = (state = {attack: [], release: []}, action) => {
    switch (action.type) {
        case Actions.ENVELOPE_SUSTAIN_CHANGE:
        case Actions.ENVELOPE_SUSTAIN_EDIT_START:
            return {
                ...state,
                editSustain: true
            };
        case Actions.ENVELOPE_SUSTAIN_EDIT_END:
            return {
                ...state,
                editSustain: false
            };
    }

    switch (action.envelopePart) {
        case "attack":
            return {
                ...state,
                attack: envelope(state.attack, action)
            };
        case "release":
            return {
                ...state,
                release: envelope(state.release, action)
            };
    }
    return state;
};


const envelopes = (state = new Array(config.modulation.source.envelope.count).fill(config.modulation.source.envelope.defaultState), action) => {
    const index = action.envelopeIndex;

    if (!isNaN(index) && action.module === "envelopes") {

        let result = [
            ...state
        ];
        result[index] = sustainedEnvelope(state[index], action);

        return result;
    }

    return state;
};

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

                case Actions.ENVELOPE_POINT_ADD:
                case Actions.ENVELOPE_BLUR:
                case Actions.ENVELOPE_POINT_EDIT_START:
                case Actions.ENVELOPE_POINT_EDIT_END:
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
