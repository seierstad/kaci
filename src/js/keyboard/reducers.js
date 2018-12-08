import {RESET} from "../settings/actions";
import {LAYOUT_CHANGE} from "./actions";
import {keyboard as defaultSettings} from "./configuration";

const settings = (state = {}, action) => {
    switch (action.type) {
        case LAYOUT_CHANGE:
            return {
                ...state,
                activeLayout: action.value
            };

        case RESET:
            return {
                ...defaultSettings
            };

        default:
            return state;
    }
};

export {
    settings
};
