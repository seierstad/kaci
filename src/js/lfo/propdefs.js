import {
    arrayOf,
    shape,
    string
} from "prop-types";

import {
    periodicModulatorConfigProperties,
    periodicModulatorPatchProperties
} from "../periodic/propdefs";

import {
    modulatorConfigProperties,
    modulatorPatchProperties
} from "../modulator/propdefs";


export const lfoPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicModulatorPatchProperties,
    "waveform": string.isRequired
});

export const lfosPatchShape = arrayOf(lfoPatchShape);

export const lfoConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicModulatorConfigProperties,
    "default": lfoPatchShape
});
