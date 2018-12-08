import {shape, number, bool, arrayOf} from "prop-types";

import {
    periodicConfigProperties,
    periodicPatchProperties
} from "../periodic/propdefs";

import {
    modulatorConfigProperties,
    modulatorPatchProperties
} from "../modulator/propdefs";


const stepPatchShape = shape({
    "glide": bool,
    "value": number.isRequired
});

export const stepsPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "levels": number.isRequired,
    "steps": arrayOf(stepPatchShape).isRequired
});

export const stepsConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": stepsPatchShape
});
