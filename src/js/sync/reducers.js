import * as SYNC from "./actions";

const sync = (state = {}, action) => {
    switch (action.type) {
        case SYNC.NUMERATOR_CHANGE:
            return {
                ...state,
                "numerator": action.value
            };

        case SYNC.DENOMINATOR_CHANGE:
            return {
                ...state,
                "denominator": action.value
            };

        case SYNC.TOGGLE:
            return {
                ...state,
                "enabled": !state.enabled
            };
    }
    return state;
};

export default sync;
