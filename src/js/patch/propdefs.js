import {shape} from "prop-types";
import {oscillatorPatchShape} from "../oscillator/propdefs";
import {noisePatchShape} from "../noise/propdefs";
import {subPatchShape} from "../sub/propdefs";
import {envelopesPatchShape} from "../envelope/propdefs";
import {lfosPatchShape} from "../lfo/propdefs";
import {modulationPatchShape} from "../modulation/propdefs";
import {mainOutPatchShape} from "../main-out/propdefs";

export const patchShape = shape({
    "main": mainOutPatchShape.isRequired,
    "oscillator": oscillatorPatchShape.isRequired,
    "noise": noisePatchShape.isRequired,
    "sub": subPatchShape.isRequired,
    "lfos": lfosPatchShape.isRequired,
    "envelopes": envelopesPatchShape.isRequired,
    "modulation": modulationPatchShape.isRequired
});
