import {combineReducers} from "redux";
import {defaultEnvParameters} from "./defaults";

import {
    DURATION_CHANGE,
    MODE_CHANGE,
    POINT_ADD,
    POINT_CHANGE,
    POINT_DELETE,
    POINT_EDIT_END,
    POINT_EDIT_START,
    SUSTAIN_CHANGE,
    SUSTAIN_EDIT_END,
    SUSTAIN_EDIT_START
} from "./actions";


const sortByX = (a, b) => (a[0] < b[0]) ? -1 : 1;

const steps = (state = [], action) => {
    const {x, y} = action;
    const point = [x, y];

    switch (action.type) {
        case POINT_DELETE:
            return [
                ...state.slice(0, action.index),
                ...state.slice(action.index + 1)
            ];

        case POINT_ADD:
            return [...state, point].sort(sortByX);

        case POINT_CHANGE:
            if (action.index === 0) {
                point[0] = 0;
            } else if (action.index === state.length - 1) {
                point[0] = 1;
            }

            const result = [
                ...state.slice(0, action.index),
                point,
                ...state.slice(action.index + 1)
            ];

            //all x values for steps after the changed step should be larger (and not equal)
            for (let i = action.index + 1; i < result.length; i += 1) {
                if (result[i - 1][0] >= result[i][0]) {
                    result[i] = [result[i - 1][0] + Number.EPSILON, result[i][1]];
                }
            }

            // x values before the changed step...
            for (let i = action.index - 1; i > 0; i -= 1) {
                if (result[i + 1][0] <= result[i][0]) {
                    result[i] = [result[i + 1][0] - Number.EPSILON, result[i][1]];
                }
            }
            return result;
    }

    return state;
};


const duration = (state = 0, action) => {
    if (action.type === DURATION_CHANGE) {
        return action.value;
    }
    return state;
};

const envelopePart = combineReducers({
    steps,
    duration
});

const sustainedEnvelope = (state = {...defaultEnvParameters}, action) => {

    switch (action.type) {
        case MODE_CHANGE:
            return {
                ...state,
                mode: action.value
            };

        case SUSTAIN_CHANGE:
            const a = state.attack.steps;
            const r = state.release.steps;

            return {
                ...state,
                attack: {
                    ...state.attack,
                    steps: [
                        ...a.slice(0, a.length - 1),
                        [1, action.value]
                    ]
                },
                release: {
                    ...state.release,
                    steps: [
                        [0, action.value],
                        ...r.slice(1)
                    ]
                }
            };
    }

    switch (action.envelopePart) {
        case "attack":
            return {
                ...state,
                attack: envelopePart(state.attack, action)
            };

        case "release":
            return {
                ...state,
                release: envelopePart(state.release, action)
            };
    }

    return state;
};

const envelopes = (state = [], action) => {
    switch (action.type) {
        case POINT_DELETE:
        case POINT_ADD:
        case POINT_EDIT_START:
        case POINT_EDIT_END:
        case POINT_CHANGE:
        case SUSTAIN_EDIT_START:
        case SUSTAIN_EDIT_END:
        case SUSTAIN_CHANGE:
        case MODE_CHANGE:
        case DURATION_CHANGE:
            const index = action.envelopeIndex;

            let result = [
                ...state
            ];
            result[index] = sustainedEnvelope(state[index], action);

            return result;
    }

    return state;
};


export {steps};
export default envelopes;