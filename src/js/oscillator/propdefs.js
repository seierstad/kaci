import {oneOf, oneOfType, shape, arrayOf, number} from "prop-types";

import {envelopePatchShape} from "../envelope/propdefs";
import {wrappers} from "../waveform/waveforms";
import {waveformShape} from "../waveform/propdefs";
import {outputStagePatchProperties} from "../output-stage/propdefs";
import {OSCILLATOR_MODE} from "./constants";
import {harmonicsShape} from "./harmonics/propdefs";

export const oscillatorModeShape = oneOf(Object.values(OSCILLATOR_MODE));

export const pdPatchShape = shape({
    "steps": envelopePatchShape.isRequired
});
export const oscillatorPdPatchShape = arrayOf(pdPatchShape);


export const wrapperPatchShape = oneOfType([
    oneOf(Object.keys(wrappers)),
    shape({
        "name": oneOf(Object.keys(wrappers)).isRequired,
        "parameter": number.isRequired
    })
]);

export const oscillatorPatchShape = shape({
    "detune": number.isRequired,
    "harm_mix": number.isRequired,
    "harmonics": harmonicsShape,
    "mode": oscillatorModeShape.isRequired,
    "pd": oscillatorPdPatchShape.isRequired,
    "pd_mix": number.isRequired,
    "resonance": number.isRequired,
    "waveform": waveformShape,
    "wrapper": wrapperPatchShape.isRequired,
    ...outputStagePatchProperties
});

