import {shape, number, bool, string, arrayOf, oneOf} from "prop-types";

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

export const slopes = ["linear", "exponential"];


export const stepsPatchShape = shape({
    ...modulatorPatchProperties,
    "glide": {
        "symmetric": bool.isRequired,
        "time": number.isRequired,
        "slope": oneOf(slopes).isRequired,
        "falling": shape({
            "time": number.isRequired,
            "slope": string.isRequired
        }).isRequired
    },
    "speed": shape(discretePeriodicModulatorPatchProperties),
    "maxValue": number.isRequired,
    "sequence": arrayOf(stepPatchShape).isRequired
});

export const stepsConfigShape = shape({
    ...modulatorConfigProperties,
    ...discretePeriodicModulatorConfigProperties,
    "default": stepsPatchShape
});
