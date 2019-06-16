import {
    arrayOf,
    bool,
    shape,
    string
} from "prop-types";

import {
    waveformShape
} from "../waveform/propdefs";

import {
    modulatorConfigProperties,
    modulatorPatchProperties
} from "../modulator/propdefs";


export const lfoPatchShape = shape({
    ...modulatorPatchProperties,
    "waveform": waveformShape.isRequired
});

export const lfosPatchShape = arrayOf(lfoPatchShape);

export const lfoConfigShape = shape({
    ...modulatorConfigProperties,
    "default": lfoPatchShape
});

export const lfoViewStateShape = shape({
    "edit": bool
});

