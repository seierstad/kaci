import {
    DENOMINATOR_CHANGE,
    NUMERATOR_CHANGE,
    TOGGLE
} from "./actions";


const dispatchers = (dispatch) => ({
    "denominatorChange": (value, index, module) => {
        dispatch({"type": DENOMINATOR_CHANGE, module, index, value});
    },
    "numeratorChange": (value, index, module) => {
        dispatch({"type": NUMERATOR_CHANGE, module, index, value});
    },
    "toggle": (index, module) => {
        dispatch({"type": TOGGLE, module, index});
    }
});

export const dispatchersForModule = module => dispatch => ({
    "denominatorChange": (value, index) => {
        dispatch({"type": DENOMINATOR_CHANGE, module, index, value});
    },
    "numeratorChange": (value, index) => {
        dispatch({"type": NUMERATOR_CHANGE, module, index, value});
    },
    "toggle": (index) => {
        dispatch({"type": TOGGLE, module, index});
    }
});


export default dispatchers;
