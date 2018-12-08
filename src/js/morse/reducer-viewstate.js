import {GUIDE_TOGGLE} from "./actions";

const morseGen = (state = {"guides": []}, action) => {
    switch (action.type) {
        case GUIDE_TOGGLE:
            const index = state.guides.indexOf(action.value);

            if (~index) {
                return {
                    ...state,
                    "guides": [
                        ...state.guides.slice(0, index),
                        ...state.guides.slice(index + 1)
                    ]
                };
            }

            return {
                ...state,
                "guides": [
                    ...state.guides,
                    action.value
                ]
            };
    }

    return state;
};

const morse = (state = [], action) => {
    if (action.module === "morse") {
        switch (action.type) {
            case GUIDE_TOGGLE:

                return [
                    ...state.slice(0, action.index),
                    morseGen(state[action.index], action),
                    ...state.slice(action.index + 1)
                ];
        }
    }

    return state;
};

export default morse;
