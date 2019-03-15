import * as HARMONIC from "./actions";

const harmonics = (state = {}, action) => {
    if (action.submodule === "harmonics") {
        const {type} = action;

        switch (type) {
            case HARMONIC.NEW:

                return {
                    "newHarmonic": {
                        "denominator": 1,
                        "enabled": true,
                        "numerator": 1
                    }
                };

            case HARMONIC.NUMERATOR_CHANGE:
                return {
                    ...state,
                    "newHarmonic": {
                        ...(state.newHarmonic),
                        "numerator": action.value
                    }
                };

            case HARMONIC.DENOMINATOR_CHANGE:
                return {
                    ...state,
                    "newHarmonic": {
                        ...(state.newHarmonic),
                        "denominator": action.value
                    }
                };

            case HARMONIC.ADD:
                const result = {...state};
                delete result.newHarmonic;

                return result;
        }
    }

    return state;
};

export default harmonics;
