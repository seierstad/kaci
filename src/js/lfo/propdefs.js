import {
    arrayOf,
    shape,
    string
} from "prop-types";

import {
    periodicConfigProperties,
    periodicPatchProperties
} from "../periodic/propdefs";

import {
    modulatorConfigProperties,
    modulatorPatchProperties
} from "../modulator/propdefs";


export const lfoPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "waveform": string.isRequired
});

export const lfosPatchShape = arrayOf(lfoPatchShape);

export const lfoConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": lfoPatchShape
});
