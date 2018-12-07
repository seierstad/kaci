import config from "../configuration";

import {
    ENVELOPE_BLUR,
    ENVELOPE_POINT_ADD,
    ENVELOPE_POINT_EDIT_END,
    ENVELOPE_POINT_EDIT_START,
    ENVELOPE_SUSTAIN_CHANGE,
    ENVELOPE_SUSTAIN_EDIT_END,
    ENVELOPE_SUSTAIN_EDIT_START
} from "./actions";

const envelope = (state = [], action) => {
    switch (action.type) {
        case ENVELOPE_POINT_ADD:
            return [
                ...state.map(el => (el >= action.index ? el + 1 : el)),
                action.index
            ];
        case ENVELOPE_BLUR:
            return [];
        case ENVELOPE_POINT_EDIT_START:
            if (state.indexOf(action.index) === -1) {
                return [...state, action.index];
            }
            break;
        case ENVELOPE_POINT_EDIT_END:
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
        case ENVELOPE_SUSTAIN_CHANGE:
        case ENVELOPE_SUSTAIN_EDIT_START:
            return {
                ...state,
                editSustain: true
            };
        case ENVELOPE_SUSTAIN_EDIT_END:
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

export {
    envelope,
    envelopes
};
