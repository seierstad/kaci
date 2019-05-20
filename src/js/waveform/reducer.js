import {FUNCTION_CHANGE, PARAMETER_CHANGE} from "./actions";
import defaultState from "./defaults";


const waveformReducer = (state = {...defaultState}, action) => {
    switch (action.type) {
        case FUNCTION_CHANGE:
            return {
                ...state,
                "name": action.value
            };
        case PARAMETER_CHANGE:
            return {
                ...state,
                "parameter": action.value
            };
    }

    return state;
};


export default waveformReducer;
