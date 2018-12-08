import {shape, number, bool} from "prop-types";
import {rangeShape} from "../static-source/propdefs";

export const syncPatchShape = shape({
    "denominator": number.isRequired,
    "enabled": bool.isRequired,
    "numerator": number.isRequired
});

export const syncConfigShape = shape({
    "numerator": rangeShape.isRequired,
    "denominator": rangeShape.isRequired
});
