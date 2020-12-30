import {shape, number, bool, string, oneOf} from "prop-types";
import {speedPatchShape} from "../speed/propdefs";

import {
    modulatorPatchProperties
} from "../modulator/propdefs";

export const slopes = ["linear", "exponential"];

const glideDirectionPatchShape = shape({
    "active": bool,
    "time": number.isRequired,
    "slope": string.isRequired
});

export const sequencerPatchProperties = {
    ...modulatorPatchProperties,
    "glide": shape({
        "mode": oneOf(["symmetric"]).isRequired,
        "down": glideDirectionPatchShape.isRequired,
        "up": glideDirectionPatchShape.isRequired
    }),
    "speed": speedPatchShape.isRequired,
    "maxValue": number.isRequired
};
