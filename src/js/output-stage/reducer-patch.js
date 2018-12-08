import {
    GAIN_CHANGE,
    PAN_CHANGE,
    TOGGLE
} from "./actions";

const output = (state, action) => {
    switch (action.type) {
        case GAIN_CHANGE:
            return {
                ...state,
                gain: action.value
            };

        case PAN_CHANGE:
            return {
                ...state,
                pan: action.value
            };

        case TOGGLE:
            return {
                ...state,
                active: !state.active
            };
    }

    return state;
};

export default output;
