import {arrayOf, shape, number} from "prop-types";

export const harmonicShape = shape({
    "denominator": number.isRequired,
    "level": number.isRequired,
    "numerator": number.isRequired,
    "phase": number.isRequired
});

export const harmonicsShape = shape({
    0: arrayOf(harmonicShape).isRequired,
    1: arrayOf(harmonicShape).isRequired
});
