import {
    bool,
    number,
    oneOf,
    shape
} from "prop-types";
import {rangeShape} from "../static-source/propdefs";
import {MODULATOR_MODE, MODULATOR_TYPE} from "./constants";


export const modulatorConfigProperties = {
    "amount": rangeShape.isRequired,
    "count": number.isRequired
};

export const modulatorConfigShape = shape({
    ...modulatorConfigProperties
});

export const modulatorModeShape = oneOf(Object.values(MODULATOR_MODE));
export const modulatorTypeShape = oneOf(Object.values(MODULATOR_TYPE));

export const modulatorShape = shape({
    "index": number.isRequired,
    "type": modulatorTypeShape.isRequired
});

export const modulatorPatchProperties = {
    "active": bool.isRequired,
    "amount": number.isRequired,
    "mode": modulatorModeShape.isRequired
};

export const modulatorPatchShape = shape({
    ...modulatorPatchProperties
});

