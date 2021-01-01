import {shape, number, bool, oneOf} from "prop-types";
import {speedPatchShape} from "../speed/propdefs";

import {
    modulatorPatchProperties
} from "../modulator/propdefs";

export const slopes = ["linear", "exponential"];

const glideDirectionPatchShape = shape({
    "active": bool,
    "time": number.isRequired,
    "slope": oneOf(slopes).isRequired
});

export const sequencerPatchProperties = {
    ...modulatorPatchProperties,
    "glide": shape({
        "down": glideDirectionPatchShape.isRequired,
        "up": glideDirectionPatchShape.isRequired
    }),
    "speed": speedPatchShape.isRequired,
    "maxValue": number.isRequired
};
