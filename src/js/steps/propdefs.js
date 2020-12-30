import {shape, number, bool, arrayOf} from "prop-types";
import {sequencerPatchProperties} from "../sequencer/propdefs";
import {modulatorConfigProperties} from "../modulator/propdefs";


const stepPatchShape = shape({
    "glide": bool,
    "value": number.isRequired
});

export const stepsPatchShape = shape({
    ...sequencerPatchProperties,
    "sequence": arrayOf(stepPatchShape).isRequired
});

export const stepsConfigShape = shape({
    ...modulatorConfigProperties,
    "default": stepsPatchShape
});
