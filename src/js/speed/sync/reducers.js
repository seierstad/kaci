import * as SYNC from "./actions";

const sync = (state = {}, action) => {
    const newValue = parseInt(action.value, 10);

    switch (action.type) {
        case SYNC.NUMERATOR_CHANGE:
            if (newValue !== state.numerator) {
                return {
                    ...state,
                    "numerator": newValue
                };
            }
            break;

        case SYNC.DENOMINATOR_CHANGE:
            if (newValue !== state.numerator) {
                return {
                    ...state,
                    "denominator": newValue
                };
            }
            break;

        case SYNC.TOGGLE:
            return {
                ...state,
                "enabled": !state.enabled
            };
    }

    return state;
};

export default sync;
