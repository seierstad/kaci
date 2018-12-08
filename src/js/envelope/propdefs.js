import {
    array,
    arrayOf,
    bool,
    number,
    oneOf,
    shape
} from "prop-types";

/* copied from ../propdefs */
import {MODULATOR_MODE} from "../modulator/constants";

export const modulatorModeShape = oneOf(Object.values(MODULATOR_MODE));
/* end copied from ../propdefs */

const envelopePointShape = (props, propName, componentName) => {
    const prop = props[propName];
    if (!Array.isArray(prop)
        || prop.length !== 2
        || typeof prop[0] !== "number"
        || props[0] > 1
        || props[0] < 0
        || typeof prop[1] !== "number"
        || props[1] > 1
        || props[1] < 0
    ) {

        return new Error(
            "Invalid prop `" + propName + "` supplied to" +
            " `" + componentName + "`. Validation failed."
        );
    }
    return true;
};

export const envelopePatchShape = arrayOf(envelopePointShape);


export const envelopeStagePatchShape = shape({
    "steps": envelopePatchShape.isRequired,
    "duration": number.isRequired
});

export const sustainEnvelopePatchShape = shape({
    "attack": envelopeStagePatchShape.isRequired,
    "release": envelopeStagePatchShape.isRequired,
    "mode": modulatorModeShape
});

export const envelopesPatchShape = arrayOf(sustainEnvelopePatchShape);

export const envelopeViewStateShape = array;

export const sustainEnvelopeViewStateShape = shape({
    "attack": envelopeViewStateShape.isRequired,
    "editSustain": bool.isRequired,
    "release": envelopeViewStateShape.isRequired
});

export const envelopeConfigShape = shape({
    "count": number.isRequired,
    "default": sustainEnvelopePatchShape.isRequired,
    "defaultState": sustainEnvelopeViewStateShape.isRequired
});
