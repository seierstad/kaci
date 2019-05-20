import {shape, number, bool, string, arrayOf, oneOf} from "prop-types";
import {speedPatchShape} from "../speed/propdefs";

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
    "glide": shape({
        "mode": oneOf(["symmetric"]).isRequired,
        "time": number.isRequired,
        "slope": oneOf(["linear", "exponential"]).isRequired,
        "falling": shape({
            "time": number.isRequired,
            "slope": string.isRequired
        }).isRequired
    }),
    "speed": speedPatchShape.isRequired,
    "maxValue": number.isRequired,
    "sequence": arrayOf(stepPatchShape).isRequired
});

export const stepsConfigShape = shape({
    ...modulatorConfigProperties,
    "default": stepsPatchShape
});
