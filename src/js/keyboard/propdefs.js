import {
    bool,
    shape,
    string,
    number,
    arrayOf
} from "prop-types";

export const keyboardLayoutShape = shape({
    "name": string.isRequired,
    "offset": number.isRequired,
    "map": arrayOf(number).isRequired
});

export const keyboardConfigShape = shape({
    "activeLayout": string.isRequired,
    "layouts": arrayOf(keyboardLayoutShape).isRequired
});

export const keyStateShape = shape({
    "down": bool,
    "number": number,
    "velocity": number,
    "aftertouch": number
});
