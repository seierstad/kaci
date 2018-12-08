import {combineReducers} from "redux";

import defaultPatch from "../patch/defaults";

import envelopes from "../envelope/reducers";
import morse from "../morse/reducers";
import modulation from "../modulation/reducers";
import chordshift from "../chord-shift/reducer-patch";
import lfos from "../lfo/reducers";
import steps from "../steps/reducers";
import sub from "../sub/reducers/patch";
import {patch as noise} from "../noise/reducers";
import oscillator from "../oscillator/reducers";
import output from "../output-stage/reducer-patch";
import * as OUTPUT from "../output-stage/actions";
import {RESET as SYSTEM_RESET} from "../settings/actions";
import {patch as main} from "../main-out/reducers";


const patch = (state = {...defaultPatch}, action) => {

    switch (action.type) {
        case SYSTEM_RESET:
            return {
                ...defaultPatch
            };

        case OUTPUT.GAIN_CHANGE:
        case OUTPUT.PAN_CHANGE:
        case OUTPUT.TOGGLE:
            return {
                ...state,
                [action.module]: output(state[action.module], action)
            };
    }

    return combineReducers({
        main,
        oscillator,
        noise,
        sub,
        lfos,
        steps,
        envelopes,
        morse,
        modulation,
        chordshift
    })(state, action);
};


export default patch;
