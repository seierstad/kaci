import {oneOf, oneOfType, object, shape, arrayOf, number} from "prop-types";
import {harmonicShape} from "../harmonics/propdefs";
import {envelopePatchShape} from "../envelope/propdefs";
import {waveforms, wrappers} from "../waveform/waveforms";
import {outputStagePatchProperties} from "../output-stage/propdefs";
import {OSCILLATOR_MODE} from "./constants";

export const oscillatorModeShape = oneOf(Object.values(OSCILLATOR_MODE));

export const pdPatchShape = shape({
    "steps": envelopePatchShape.isRequired
});
export const oscillatorPdPatchShape = arrayOf(pdPatchShape);


export const wrapperPatchShape = oneOfType([
    oneOf(Object.keys(wrappers)),
    shape({
        "name": oneOf(Object.keys(wrappers)).isRequired,
        "parameters": object.isRequired
    })
]);

export const oscillatorPatchShape = shape({
    "detune": number.isRequired,
    "harmonics": arrayOf(harmonicShape),
    "mix": number.isRequired,
    "mode": oscillatorModeShape.isRequired,
    "pd": oscillatorPdPatchShape.isRequired,
    "resonance": number.isRequired,
    "waveform": oneOf(Object.keys(waveforms)),
    "wrapper": wrapperPatchShape.isRequired,
    ...outputStagePatchProperties
});

