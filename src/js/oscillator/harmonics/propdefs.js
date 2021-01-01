import {arrayOf, shape, number} from "prop-types";

export const harmonicShape = shape({
    "denominator": number.isRequired,
    "level": number.isRequired,
    "numerator": number.isRequired,
    "phase": number.isRequired
});

export const harmonicSeriesShape = arrayOf(harmonicShape);

export const harmonicsShape = shape({
    0: harmonicSeriesShape.isRequired,
    1: harmonicSeriesShape.isRequired
});
