import * as Actions from "../actions";

const sync = (state = {}, action) => {
    switch (action.type) {
        case Actions.SYNC_NUMERATOR_CHANGE:
            return {
                ...state,
                "numerator": action.value
            };

        case Actions.SYNC_DENOMINATOR_CHANGE:
            return {
                ...state,
                "denominator": action.value
            };

        case Actions.SYNC_TOGGLE:
            return {
                ...state,
                "enabled": !state.enabled
            };
    }
    return state;
};

export default sync;
