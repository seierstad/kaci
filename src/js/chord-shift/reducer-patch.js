import {MODE_CHANGE} from "./actions";

const chordShift = (state = {"mode": "portamento"}, action) => {
    switch (action.type) {
        case MODE_CHANGE:
            if (state.mode !== action.mode) {
                return {
                    ...state,
                    "mode": action.mode
                };
            }
            break;

        default:
            break;
    }

    return state;
};


export default chordShift;
