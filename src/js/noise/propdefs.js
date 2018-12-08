import {shape, oneOf} from "prop-types";
import {outputStagePatchProperties} from "../output-stage/propdefs";

import noise from "./noise";


export const noisePatchShape = shape({
    "color": oneOf(Object.keys(noise)),
    ...outputStagePatchProperties
});
