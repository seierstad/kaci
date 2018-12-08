import {shape, number} from "prop-types";

export const harmonicShape = shape({
    "denominator": number.isRequired,
    "level": number.isRequired,
    "numerator": number.isRequired
});
