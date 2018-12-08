import {shape, bool, number} from "prop-types";

export const rangeShape = shape({
    "exponential": bool,
    "max": number.isRequired,
    "mid": number,
    "min": number.isRequired,
    "step": number
});
