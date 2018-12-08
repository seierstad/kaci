import * as HARMONIC from "../harmonics/actions";
import harmonics from "../harmonics/viewstate-reducer";
import {
    ENVELOPE_BLUR,
    ENVELOPE_POINT_ADD,
    ENVELOPE_POINT_EDIT_END,
    ENVELOPE_POINT_EDIT_START
} from "../envelope/actions";

import {envelope} from "../envelope/viewstate-reducers";


const oscillator = (state = {"pd": [[], []]}, action) => {
    if (action.module === "oscillator") {

        if (action.hasOwnProperty("envelopeIndex")) {

            switch (action.type) {

                case ENVELOPE_POINT_ADD:
                case ENVELOPE_BLUR:
                case ENVELOPE_POINT_EDIT_START:
                case ENVELOPE_POINT_EDIT_END:
                    const pd = [...state.pd];
                    pd[action.envelopeIndex] = envelope([...state.pd[action.envelopeIndex]], action);

                    return {
                        ...state,
                        pd
                    };
            }

        } else if (action.submodule === "harmonics") {

            switch (action.type) {

                case HARMONIC.NEW:
                case HARMONIC.ADD:
                case HARMONIC.DENOMINATOR_CHANGE:
                case HARMONIC.NUMERATOR_CHANGE:

                    return {
                        ...state,
                        harmonics: harmonics(state.harmonics, action)
                    };
            }
        }
    }


    return state;
};

export default oscillator;
