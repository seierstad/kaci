import {shape, number, oneOf} from "prop-types";
import {outputStagePatchProperties} from "../output-stage/propdefs";
import {syncPatchShape} from "../speed/sync/propdefs";

export const subPatchShape = shape({
    "beat": shape({
        "frequency": number.isRequired,
        "sync": syncPatchShape.isRequired
    }),
    "depth": number.isRequired,
    "detune": number.isRequired,
    "mode": oneOf(["semitone", "beat"]).isRequired,
    ...outputStagePatchProperties
});
