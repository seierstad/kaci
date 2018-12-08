import {shape} from "prop-types";
import {outputStagePatchProperties} from "../output-stage/propdefs";

export const mainOutPatchShape = shape({
    ...outputStagePatchProperties
});
