import {
    array,
    arrayOf,
    shape
} from "prop-types";

//import {tuningShape} from "./tuning/propdefs";
import {keyboardConfigShape} from "./keyboard/propdefs";
//import {modulationConfigShape} from "./modulation/propdefs";
import {sustainEnvelopeViewStateShape} from "./envelope/propdefs";
import {midiShape} from "./midi/propdefs";
import {morseGeneratorViewStateShape} from "./morse/propdefs";


export const viewStateShape = shape({
    "envelopes": arrayOf(sustainEnvelopeViewStateShape),
    "oscillator": shape({
        "pd": arrayOf(array)
    }),
    "morse": arrayOf(morseGeneratorViewStateShape)
});

export const configurationShape = shape({
    "keyboard": keyboardConfigShape.isRequired,
    "midi": midiShape.isRequired /*,
    "modulation": modulationConfigShape.isRequired,
    "tuning": tuningShape.isRequired
    */
});

