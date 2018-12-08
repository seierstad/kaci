import {bool, number, shape} from "prop-types";
import {rangeShape} from "../static-source/propdefs";

export const outputStagePatchProperties = {
    "active": bool.isRequired,
    "gain": number.isRequired,
    "pan": number.isRequired
};

export const outputStagePatchShape = shape({
    ...outputStagePatchProperties
});

export const outputTargetShape = shape({
    "gain": rangeShape.isRequired,
    "pan": rangeShape.isRequired
});
