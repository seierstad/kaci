import * as ENVELOPE from "../envelope/actions";
import {envelope} from "../envelope/viewstate-reducers";

import * as HARMONIC from "./harmonics/actions";
import harmonics from "./harmonics/viewstate-reducer";

import wavetableGenerator from "./wavetable-generator/viewstate-reducer";


const oscillator = (state = {
    "pd": [[], []],
    "harmonics": harmonics(),
    "wavetableGenerator": wavetableGenerator()
}, action) => {
    if (action.module === "oscillator") {

        if (Object.prototype.hasOwnProperty.call(action, "envelopeIndex")) {

            switch (action.type) {

                case ENVELOPE.POINT_ADD:
                case ENVELOPE.BLUR:
                case ENVELOPE.POINT_EDIT_START:
                case ENVELOPE.POINT_EDIT_END:
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
        } else if (action.submodule === "wavetable-generator") {
            return {
                ...state,
                wavetableGenerator: wavetableGenerator(state.wavetableGenerator, action)
            };
        }
    }


    return state;
};

export default oscillator;
