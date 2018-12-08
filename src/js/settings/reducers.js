import {combineReducers} from "redux";

import tuning from "../tuning/reducers";
import midi from "../midi/reducers/settings";
import {settings as keyboard} from "../keyboard/reducers";
import {CONFIGURATION_SET, RESET} from "./actions";

const nullReducer = (state = {}) => state;
const modulation = nullReducer;

const settings = (state, action) => {
    if (action.type === CONFIGURATION_SET) {
        return action.configuration;
    }
    if (action.type === RESET) {
        return {
            keyboard: keyboard(),
            midi: midi(),
            tuning: tuning(),
            modulation: modulation()
        };
    }
    return combineReducers({
        keyboard,
        midi,
        tuning,
        modulation
    })(state, action);
};

export default settings;
