import {GENERATOR_SELECT} from "./actions";

const instanceReducer = (state = {}, action) => {
    const {
        type
    } = action;
    switch (type) {
        case GENERATOR_SELECT:
            return {
                ...state,
                selectedGenerator: action.generatorName
            };
    }

    return state;
};

const viewstateReducer = (state = {instances: []}, action) => {
    const {
        type,
        index
    } = action;

    switch (type) {
        case GENERATOR_SELECT: {
            const result = {
                ...state,
                instances: [
                    ...state.instances
                ]
            };
            result.instances[index] = instanceReducer(state.instances[index], action);
            return result;
        }
    }

    return state;
};

export default viewstateReducer;
