import speedReducer from "../../speed/reducer";
import {
    DEPTH_CHANGE,
    DETUNE_CHANGE,
    DETUNE_MODE_CHANGE
} from "../actions";

const sub = (state = {}, action) => {
    switch (action.type) {

        case DEPTH_CHANGE:
            return {
                ...state,
                depth: action.value
            };

        case DETUNE_CHANGE:
            return {
                ...state,
                detune: action.value
            };

        case DETUNE_MODE_CHANGE:
            return {
                ...state,
                mode: action.value
            };
    }

    if (action.module === "sub") {
        const currentSpeed = state.beat;
        const newSpeed = speedReducer(currentSpeed, action);

        if (newSpeed !== currentSpeed) {
            return {
                ...state,
                beat: newSpeed
            };
        }
    }

    return state;
};

export default sub;
