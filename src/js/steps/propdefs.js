import {shape, number, bool, arrayOf} from "prop-types";

import {
    discretePeriodicModulatorPatchProperties,
    discretePeriodicModulatorConfigProperties
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
    "speed": shape(discretePeriodicModulatorPatchProperties),
    "maxValue": number.isRequired,
    "sequence": arrayOf(stepPatchShape).isRequired
});

export const stepsConfigShape = shape({
    ...modulatorConfigProperties,
    ...discretePeriodicModulatorConfigProperties,
    "default": stepsPatchShape
});
