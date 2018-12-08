import {bool, number, shape, objectOf} from "prop-types";
import {chordShiftPlayStateShape} from "../chord-shift/propdefs";
import {keyStateShape} from "../keyboard/propdefs";

export const playStateShape = shape({
    "chordShift": chordShiftPlayStateShape.isRequired,
    "hold": bool,
    "keys": objectOf(keyStateShape).isRequired,
    "pitchShift": number.isRequired
});
