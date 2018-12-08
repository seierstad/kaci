import {COLOR_CHANGE} from "./actions";

const patch = (state = {}, action) => {
    switch (action.type) {
        case COLOR_CHANGE:
            return {
                ...state,
                color: action.value
            };
    }

    return state;
};


export {
    patch
};
