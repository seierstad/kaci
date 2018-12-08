import {shape, number, oneOf, objectOf, arrayOf} from "prop-types";

import {keyStateShape} from "../keyboard/propdefs";
import {CHORD_SHIFT_MODE} from "./constants";


export const chordShape = objectOf(keyStateShape);

const chordShiftModes = Object.values(CHORD_SHIFT_MODE);

export const chordShiftPatchShape = shape({
    "mode": oneOf(chordShiftModes).isRequired
});

export const chordShiftPlayStateShape = shape({
    "value": number.isRequired,
    "activeKeys": objectOf(keyStateShape).isRequired,
    "chords": arrayOf(chordShape)
});
