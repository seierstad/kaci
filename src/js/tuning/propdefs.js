import {
    shape,
    number,
    arrayOf,
    oneOf,
    oneOfType
} from "prop-types";


export const temperedScaleShape = shape({
    "type": oneOf(["tempered"]),
    "notes": number.isRequired,
    "base": number.isRequired
});

const pow = arrayOf(number);
const fraction = arrayOf(oneOfType([number, pow]));
const ratioShape = oneOfType([number, fraction]);

export const rationalScaleShape = shape({
    "type": oneOf(["rational"]),
    "ratios": arrayOf(ratioShape).isRequired,
    "baseKey": number.isRequired
});

export const scaleShape = oneOfType([temperedScaleShape, rationalScaleShape]);


export const tuningShape = shape({
    "baseFrequency": shape({
        "min": number.isRequired,
        "max": number.isRequired,
        "value": number.isRequired
    }).isRequired,
    "keys": shape({
        "min": number.isRequired,
        "max": number.isRequired
    }),
    "scale": scaleShape.isRequired,
    "scales": arrayOf(scaleShape)
});
