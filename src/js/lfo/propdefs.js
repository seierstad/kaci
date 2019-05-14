import {
    arrayOf,
    shape,
    string
} from "prop-types";

import {
    modulatorConfigProperties,
    modulatorPatchProperties
} from "../modulator/propdefs";


export const lfoPatchShape = shape({
    ...modulatorPatchProperties,
    "waveform": string.isRequired
});

export const lfosPatchShape = arrayOf(lfoPatchShape);

export const lfoConfigShape = shape({
    ...modulatorConfigProperties,
    "default": lfoPatchShape
});
