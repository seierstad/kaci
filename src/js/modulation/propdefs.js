import {
    arrayOf,
    bool,
    number,
    objectOf,
    oneOf,
    oneOfType,
    shape
} from "prop-types";

import {outputTargetShape} from "../output-stage/propdefs";
import {lfoConfigShape} from "../lfo/propdefs";
import {envelopeConfigShape} from "../envelope/propdefs";
import {morseConfigShape} from "../morse/propdefs";
import {stepsConfigShape} from "../steps/propdefs";
import {modulatorShape} from "../modulator/propdefs";

import {rangeShape} from "../static-source/propdefs";

import {RANGE} from "./constants";


export const polarityShape = oneOf(Object.values(RANGE));

export const modulationConnectionPatchShape = shape({
    "amount": number.isRequired,
    "enabled": bool,
    "polarity": polarityShape.isRequired,
    "source": modulatorShape.isRequired
});

export const modulationTargetParameterShape = arrayOf(modulationConnectionPatchShape);

export const modulationTargetModuleShape = objectOf(modulationTargetParameterShape);

export const modulationPatchShape = shape({
    "oscillator": modulationTargetModuleShape,
    "sub": modulationTargetModuleShape,
    "noise": modulationTargetModuleShape,
    "vca": modulationTargetModuleShape
});

export const connectionShape = shape({
    "default": shape({
        "enabled": bool.isRequired,
        "polarity": polarityShape,
        "amount": number.isRequired
    })
});

export const modulationTargetShape = objectOf(oneOfType([rangeShape, outputTargetShape]));

export const modulationTargetsConfigShape = shape({
    "noise": modulationTargetShape.isRequired,
    "oscillator": modulationTargetShape.isRequired,
    "sub": modulationTargetShape.isRequired,
    "main": modulationTargetShape.isRequired
});

export const modulationConfigShape = shape({
    "connection": connectionShape.isRequired,
    "source": shape({
        "envelope": envelopeConfigShape.isRequired,
        "lfo": lfoConfigShape.isRequired,
        "steps": stepsConfigShape.isRequired,
        "morse": morseConfigShape.isRequired
    }).isRequired,
    "target": modulationTargetsConfigShape.isRequired
});
