import {
    arrayOf,
    bool,
    number,
    shape,
    string
} from "prop-types";

import {modulatorConfigProperties} from "../modulator/propdefs";


export const morseGeneratorPatchShape = shape({
    "text": string.isRequired,
    "speedUnit": number,
    "shift": number,
    "padding": number,
    "fillToFit": bool
});

export const morseGeneratorsPatchShape = arrayOf(morseGeneratorPatchShape);

export const morseGeneratorViewStateShape = shape({
    "guides": arrayOf(number)
});


export const morseConfigShape = shape({
    ...modulatorConfigProperties,
    "default": morseGeneratorPatchShape
});
